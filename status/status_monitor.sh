#!/usr/bin/env bash

# Enhanced Status Monitoring Script for taniainteractive

# Strict mode for better error handling
set -euo pipefail

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a status_monitor.log
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
    local ipversion=""
    local rc=0

    log "Checking service: ${name} (${host})"

    # Determine IP version
    [[ "${check}" =~ [46]$ ]] && ipversion="${BASH_REMATCH[0]}"

    case "${check}" in
        http*)
            # HTTP/HTTPS check
            rc=$(curl -${ipversion}sSkLo /dev/null -H "User-Agent: taniainteractive Status Monitor" -m 10 -w "%{http_code}" "${host}" 2>"${tmp_dir}/${name}.error" || true)
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

    # Check result
    if [[ "${rc}" -eq "${expected_rc}" ]]; then
        echo "OK" > "${tmp_dir}/${name}.status"
        log "Service ${name} is operational"
    else
        echo "FAIL" > "${tmp_dir}/${name}.status"
        log "Service ${name} is disrupted (Return Code: ${rc})"
        cat "${tmp_dir}/${name}.error" >> status_errors.log
    fi
}

# Generate HTML status page
generate_status_page() {
    local tmp_dir="${1}"
    local output_file="status/index.html"
    local history_dir="status/history"
    local history_file="${history_dir}/status_$(date +%Y%m%d_%H%M%S).html"

    # Ensure history directory exists
    mkdir -p "${history_dir}"

    log "Generating status page"

    # Start HTML generation
    cat > "${output_file}" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
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
    </style>
</head>
<body>
    <div class="status-container">
        <div class="status-header">
            <h1>taniainteractive Status</h1>
            <button class="theme-toggle" aria-label="Toggle dark/light mode" onclick="toggleTheme()">🌓</button>
        </div>

        <div id="global-status">
            <span class="status-badge $([ "$(find "${tmp_dir}" -name "*.status" | grep -c "FAIL") -eq 0" ] && echo "operational" || echo "disrupted")">
                $([ "$(find "${tmp_dir}" -name "*.status" | grep -c "FAIL") -eq 0" ] && echo "All Systems Operational" || echo "Services Disrupted")
            </span>
        </div>

        <h2>Services Status</h2>
        <ul class="service-list">
EOF

    # Add service statuses
    for status_file in "${tmp_dir}"/*.status; do
        name=$(basename "${status_file}" .status)
        status=$(cat "${status_file}")
        cat >> "${output_file}" << EOF
            <li class="service-item">
                <span>${name}</span>
                <span class="status-badge $([ "${status}" = "OK" ] && echo "operational" || echo "disrupted")">
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
                $([ -s "status/incidents.txt" ] && sed 's/^/<p>/' "status/incidents.txt" | sed 's/$/<\/p>/' || echo "<p>No active incidents</p>")
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

    # Copy to history
    cp "${output_file}" "${history_file}"
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
    done < status/checks.csv
    wait

    # Generate status page
    generate_status_page "${tmp_dir}"

    # Cleanup
    rm -rf "${tmp_dir}"

    log "Status monitoring completed"
}

# Execute main function
main