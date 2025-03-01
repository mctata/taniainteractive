#!/usr/bin/env bash

# Enhanced Status Monitoring Script for taniainteractive

set -e

# Create log directory if it doesn't exist
LOG_DIR="/tmp/taniainteractive_status"
mkdir -p "${LOG_DIR}"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "${LOG_DIR}/status_monitor.log"
}

# HTTP Check Function
http_check() {
    local url="${1}"
    local expected_code="${2}"
    local name="${3}"
    local tmp_dir="${4}"

    log "Checking ${name}: ${url}"

    # Use curl with max redirects and return last response code
    local response
    response=$(curl -sS -L -o "${tmp_dir}/${name// /_}.body" -w "%{http_code}" \
        -H "User-Agent: taniainteractive Status Monitor" \
        -m 10 "${url}" 2>"${tmp_dir}/${name// /_}.error")

    log "Response Code for ${name}: ${response}"

    if [[ "${response}" -eq "${expected_code}" ]]; then
        echo "Operational" > "${tmp_dir}/${name// /_}.status"
        log "${name} is operational"
    else
        echo "Disrupted (HTTP ${response})" > "${tmp_dir}/${name// /_}.status"
        log "${name} is disrupted (Return Code: ${response})"
    fi
}

# Generate Status Page
generate_status_page() {
    local tmp_dir="${1}"
    local output_file="index.html"

    # Determine global status
    local global_status="operational"
    local global_message="All Systems Operational"

    if find "${tmp_dir}" -name "*.status" -print0 | xargs -0 grep -q "Disrupted"; then
        global_status="disrupted"
        global_message="Services Disrupted"
    fi

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

        <div>
            <span class="status-badge ${global_status}">
                ${global_message}
            </span>
        </div>

        <h2>Services Status</h2>
        <ul class="service-list">
EOF

    # Ensure both services are displayed, even if they weren't checked
    services=("Web_Application" "Database")
    for service in "${services[@]}"; do
        status_file="${tmp_dir}/${service}.status"
        
        # Use a default status if file doesn't exist
        if [ ! -f "${status_file}" ]; then
            echo "Unknown" > "${status_file}"
        fi

        name=$(echo "${service}" | sed 's/_/ /g')
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

    cat >> "${output_file}" << EOF
        </ul>

        <div class="incidents-section">
            <h2>Incidents</h2>
            <div id="incidents-content">
EOF

    # Add incidents
    if [ -f "incidents.txt" ] && [ -s "incidents.txt" ]; then
        while IFS= read -r incident; do
            cat >> "${output_file}" << EOF
                <div class="incident">
                    <p>${incident}</p>
                </div>
EOF
        done < incidents.txt
    else
        cat >> "${output_file}" << EOF
                <p>No active incidents</p>
EOF
    fi

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

    log "Status page generated"
}

# Main Execution
main() {
    log "Starting Status Monitoring"

    # Create temporary directory
    tmp_dir=$(mktemp -d)
    log "Temporary directory: ${tmp_dir}"

    # Read checks from CSV
    while IFS="," read -r check expected_code name host; do
        # Skip header
        [[ "${check}" == "check" ]] && continue

        # Perform HTTP check
        http_check "${host}" "${expected_code}" "${name}" "${tmp_dir}"
    done < checks.csv

    # Generate status page
    generate_status_page "${tmp_dir}"

    # Cleanup
    rm -rf "${tmp_dir}"

    log "Status Monitoring Completed"
}

# Run main function
main