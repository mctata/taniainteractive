#!/usr/bin/env bash

# Enhanced Status Monitoring Script for taniainteractive

# Exit on any error
set -e

# Print commands for debugging
set -x

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a /tmp/status_monitor.log
}

# Error handling
handle_error() {
    log "ERROR: $*"
    exit 1
}

# Dependency check
check_dependencies() {
    local deps=("curl" "nc" "ping" "awk" "sed")
    for dep in "${deps[@]}"; do
        if ! command -v "${dep}" >/dev/null 2>&1; then
            log "Dependency missing: ${dep}"
            exit 1
        fi
    done
}

# Perform HTTP check
http_check() {
    local url="${1}"
    local expected_code="${2}"
    local name="${3}"
    local tmp_dir="${4}"

    log "Checking HTTP: ${url}"
    
    # Perform curl with verbose output
    local response
    response=$(curl -sS -o "${tmp_dir}/${name}.body" -w "%{http_code}" \
        -H "User-Agent: taniainteractive Status Monitor" \
        -m 10 "${url}" 2>"${tmp_dir}/${name}.error")
    
    local rc=$?

    log "HTTP Check Details:"
    log "URL: ${url}"
    log "Response Code: ${response}"
    log "Curl Exit Code: ${rc}"
    log "Expected Code: ${expected_code}"

    # Check if response matches expected code
    if [[ "${response}" -eq "${expected_code}" ]]; then
        echo "OK" > "${tmp_dir}/${name}.status"
        log "Service ${name} is operational"
    else
        echo "FAIL (HTTP ${response})" > "${tmp_dir}/${name}.status"
        log "Service ${name} is disrupted (Return Code: ${response})"
        
        # Capture error details
        cat "${tmp_dir}/${name}.error" >> /tmp/status_errors.log
        cat "${tmp_dir}/${name}.body" >> /tmp/status_body.log
    fi
}

# Port check
port_check() {
    local host="${1}"
    local port="${2}"
    local name="${3}"
    local tmp_dir="${4}"

    log "Checking Port: ${host}:${port}"
    
    # Use nc to check port
    if nc -zw5 "${host}" "${port}" >/dev/null 2>&1; then
        echo "OK" > "${tmp_dir}/${name}.status"
        log "Port ${name} is open"
    else
        echo "FAIL" > "${tmp_dir}/${name}.status"
        log "Port ${name} is closed"
    fi
}

# Main monitoring function
monitor_services() {
    local tmp_dir=$(mktemp -d)
    log "Temporary directory: ${tmp_dir}"

    # Web Application Check
    http_check "https://taniainteractive.co.uk" 200 "Web Application" "${tmp_dir}"

    # Dummy Test Site Check (non-existent path)
    http_check "https://taniainteractive.co.uk/dummy-test-site" 400 "Dummy Test Site" "${tmp_dir}"

    # Port Check
    port_check "taniainteractive.co.uk" 443 "Web Application Port" "${tmp_dir}"

    # Generate status page
    generate_status_page "${tmp_dir}"

    # Cleanup
    rm -rf "${tmp_dir}"
}

# Status page generation
generate_status_page() {
    local tmp_dir="${1}"
    local output_file="index.html"

    # Determine global status
    local global_status="operational"
    local global_message="All Systems Operational"

    # Check if any service failed
    if find "${tmp_dir}" -name "*.status" | xargs grep -q "FAIL"; then
        global_status="disrupted"
        global_message="Services Disrupted"
    fi

    # Start HTML generation (simplified for debugging)
    cat > "${output_file}" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>taniainteractive Status</title>
</head>
<body>
    <h1>Service Status</h1>
    <p>Global Status: ${global_message}</p>
    
    <h2>Services</h2>
    <ul>
EOF

    # Add service statuses
    for status_file in "${tmp_dir}"/*.status; do
        local name=$(basename "${status_file}" .status)
        local status=$(cat "${status_file}")
        echo "<li>${name}: ${status}</li>" >> "${output_file}"
    done

    # Add incidents
    cat >> "${output_file}" << EOF
    </ul>

    <h2>Incidents</h2>
    <pre>
EOF

    # Include incidents
    if [ -f "incidents.txt" ]; then
        cat incidents.txt >> "${output_file}"
    else
        echo "No incidents reported." >> "${output_file}"
    fi

    cat >> "${output_file}" << EOF
    </pre>
</body>
</html>
EOF

    log "Status page generated"
}

# Main execution
main() {
    log "Starting Status Monitoring"
    check_dependencies
    monitor_services
    log "Status Monitoring Completed"
}

# Run the script
main