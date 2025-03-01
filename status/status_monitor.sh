#!/usr/bin/env bash

# Enhanced Status Monitoring Script for taniainteractive

# Strict mode for better error handling
set -euo pipefail

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a status_monitor_verbose.log
}

# Error handling function
handle_error() {
    log "ERROR: $*"
    exit 1
}

# Dependency check
check_dependencies() {
    local deps=("curl" "nc" "ping" "awk" "sed")
    for dep in "${deps[@]}"; do
        command -v "${dep}" >/dev/null 2>&1 || handle_error "${dep} is not installed"
    done
}

# CSV field extraction
get_field() {
    echo "${1}" | awk -v col="${2}" -F',' '{gsub(/^[ \t]+|[ \t]+$/, "", $col); print $col}'
}

# Perform service check
check_service() {
    local check="${1}"
    local host="${2}"
    local name="${3}"
    local expected_rc="${4}"
    local tmp_dir="${5}"
    local rc=0
    local error_msg=""

    log "Checking service: ${name} (${host})"

    # Determine IP version
    local ipversion=""
    [[ "${check}" =~ [46]$ ]] && ipversion="${BASH_REMATCH[0]}"

    case "${check}" in
        http*)
            # HTTP/HTTPS check with full error handling
            local response
            response=$(curl -${ipversion}sSkL -o /dev/null -w "%{http_code}|%{http_connect}" \
                -H "User-Agent: taniainteractive Status Monitor" \
                -m 10 "${host}" 2>"${tmp_dir}/${name}.error" || echo "0|0")
            
            # Split response into status code and connection code
            rc=$(echo "${response}" | cut -d'|' -f1)
            local conn_code=$(echo "${response}" | cut -d'|' -f2)
            
            # Capture error details if any
            if [ -s "${tmp_dir}/${name}.error" ]; then
                error_msg=$(cat "${tmp_dir}/${name}.error}")
            fi
            ;;
        ping*)
            # Ping check
            ping -${ipversion}W 10 -c 1 "${host}" >/dev/null 2>&1
            rc=$?
            ;;
        port*)
            # Port connectivity check
            nc -${ipversion}zw 10 "${host}" >/dev/null 2>&1
            rc=$?
            ;;
        *)
            handle_error "Unsupported check type: ${check}"
            ;;
    esac

    log "Service ${name} check result: RC=${rc}, Expected=${expected_rc}"

    # Check result
    if [[ "${rc}" -eq "${expected_rc}" ]]; then
        echo "OK" > "${tmp_dir}/${name}.status"
        log "Service ${name} is operational"
    else
        echo "FAIL (HTTP ${rc})" > "${tmp_dir}/${name}.status"
        log "Service ${name} is disrupted (Return Code: ${rc})"
        
        # Log error details
        if [ -n "${error_msg}" ]; then
            echo "Error: ${error_msg}" >> "${tmp_dir}/${name}.error"
        fi
        
        # Append to global error log
        cat "${tmp_dir}/${name}.error" >> status_errors.log
    fi
}

# Generate HTML status page
generate_status_page() {
    local tmp_dir="${1}"
    local output_file="index.html"
    local history_dir="history"

    # Ensure history directory exists
    mkdir -p "${history_dir}"

    log "Generating status page to ${output_file}"

    # Determine global status
    local global_status="operational"
    local global_message="All Systems Operational"
    for status_file in "${tmp_dir}"/*.status; do
        if grep -q "FAIL" "${status_file}"; then
            global_status="disrupted"
            global_message="Services Disrupted"
            break
        fi
    done

    # Start HTML generation
    cat > "${output_file}" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>taniainteractive Status</title>
    <style>
        :root {
            --bg-primary: #ffffff;
            --bg-secondary: #f4f4f4;
            --text-primary: #333333;
            --text-secondary: #666666;
            --operational-bg: #4CAF50;
            --disrupted-bg: #F44336;
            --border-color: #dddddd;
        }

        @media (prefers-color-scheme: dark) {
            :root {
                --bg-primary: #121212;
                --bg-secondary: #1e1e1e;
                --text-primary: #ffffff;
                --text-secondary: #b0b0b0;
                --operational-bg: #2E7D32;
                --disrupted-bg: #C62828;
                --border-color: #333333;
            }
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
            background-color: var(--bg-primary);
            color: var(--text-primary);
            transition: background-color 0.3s, color 0.3s;
        }

        .status-container {
            background-color: var(--bg-secondary);
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }

        .status-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 15px;
            margin-bottom: 20px;
        }

        .status-badge {
            padding: 8px 15px;
            border-radius: 4px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .operational {
            background-color: var(--operational-bg);
            color: white;
        }

        .disrupted {
            background-color: var(--disrupted-bg);
            color: white;
        }

        .service-list {
            list-style-type: none;
            padding: 0;
        }

        .service-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid var(--border-color);
        }

        .service-item:last-child {
            border-bottom: none;
        }

        .theme-toggle {
            background: none;
            border: none;
            cursor: pointer;
            font-size: 1.2em;
            padding: 10px;
        }

        @media screen and (max-width: 600px) {
            .status-header {
                flex-direction: column;
                align-items: flex-start;
            }
        }

        .incidents-section {
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid var(--border-color);
        }

        .incident {
            background-color: var(--bg-primary);
            border-left: 4px solid orange;
            padding: 10px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="status-container">
        <div class="status-header">
            <h1>taniainteractive Status</h1>
            <button class="theme-toggle" aria-label="Toggle dark/light mode" onclick="toggleTheme()">🌓</button>
        </div>

        <div id="global-status">
            <span class="status-badge ${global_status}">${global_message}</span>
        </div>

        <h2>Services Status</h2>
        <ul class="service-list">
EOF

    # Add service statuses
    for status_file in "${tmp_dir}"/*.status; do
        name=$(basename "${status_file}" .status)
        status=$(cat "${status_file}")
        status_class=$(echo "${status}" | cut -d' ' -f1 | tr '[:upper:]' '[:lower:]')
        cat >> "${output_file}" << EOF
            <li class="service-item">
                <span>${name}</span>
                <span class="status-badge ${status_class}">
                    ${status}
                </span>
            </li>
EOF
    done

    # Add incidents section
    cat >> "${output_file}" << EOF
        </ul>

        <div class="incidents-section">
            <h2>Incidents</h2>
            <div id="incidents-content">
EOF

    # Process incidents
    if [ -s "incidents.txt" ]; then
        while IFS= read -r incident; do
            if [ -n "${incident}" ]; then
                cat >> "${output_file}" << EOF
                <div class="incident">
                    <p>${incident}</p>
                </div>
EOF
            fi
        done < incidents.txt
    else
        cat >> "${output_file}" << EOF
                <p>No active incidents</p>
EOF
    fi

    # Close HTML
    cat >> "${output_file}" << EOF
            </div>
        </div>
    </div>

    <script>
        function toggleTheme() {
            const root = document.documentElement;
            const currentTheme = localStorage.getItem('theme') || 'light';
            
            if (currentTheme === 'light') {
                root.style.setProperty('--bg-primary', '#121212');
                root.style.setProperty('--bg-secondary', '#1e1e1e');
                root.style.setProperty('--text-primary', '#ffffff');
                root.style.setProperty('--text-secondary', '#b0b0b0');
                root.style.setProperty('--operational-bg', '#2E7D32');
                root.style.setProperty('--disrupted-bg', '#C62828');
                root.style.setProperty('--border-color', '#333333');
                localStorage.setItem('theme', 'dark');
            } else {
                root.style.setProperty('--bg-primary', '#ffffff');
                root.style.setProperty('--bg-secondary', '#f4f4f4');
                root.style.setProperty('--text-primary', '#333333');
                root.style.setProperty('--text-secondary', '#666666');
                root.style.setProperty('--operational-bg', '#4CAF50');
                root.style.setProperty('--disrupted-bg', '#F44336');
                root.style.setProperty('--border-color', '#dddddd');
                localStorage.setItem('theme', 'light');
            }
        }

        // Persist theme preference
        window.addEventListener('load', () => {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark') {
                toggleTheme();
            }
        });
    </script>
</body>
</html>
EOF

    log "Status page generation complete"
}

# Main execution
main() {
    log "Starting status monitoring"
    
    check_dependencies

    # Create temporary directory
    tmp_dir=$(mktemp -d)

    # Perform service checks
    while IFS=$'\n' read -r line; do
        # Skip header line
        [[ "${line}" =~ ^check, ]] && continue

        check=$(get_field "${line}" 1)
        code=$(get_field "${line}" 2)
        name=$(get_field "${line}" 3)
        host=$(get_field "${line}" 4)
        check_service "${check}" "${host}" "${name}" "${code}" "${tmp_dir}" &
    done < checks.csv
    wait

    # Generate status page
    generate_status_page "${tmp_dir}"

    # Cleanup
    rm -rf "${tmp_dir}"

    log "Status monitoring completed"
}

# Execute main function
main