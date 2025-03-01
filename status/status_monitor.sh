#!/usr/bin/env bash

# Enhanced Status Monitoring Script for taniainteractive

# Exit immediately if a command exits with a non-zero status
set -e

# Print commands and their arguments as they are executed
set -x

# Ensure script is run from the correct directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "${SCRIPT_DIR}"

# Logging function with more verbose output
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a status_monitor_verbose.log
}

# Error handling function
handle_error() {
    echo "ERROR: $*" >&2
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

    log "Checking service: ${name} (${host})"

    # Determine IP version
    local ipversion=""
    [[ "${check}" =~ [46]$ ]] && ipversion="${BASH_REMATCH[0]}"

    case "${check}" in
        http*)
            # HTTP/HTTPS check
            rc=$(curl -${ipversion}sSkLo /dev/null -H "User-Agent: taniainteractive Status Monitor" -m 10 -w "%{http_code}" "${host}" 2>"${tmp_dir}/${name}.error" || echo 0)
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
        echo "FAIL" > "${tmp_dir}/${name}.status"
        log "Service ${name} is disrupted (Return Code: ${rc})"
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

    # Check if any status files exist
    if [ ! "$(find "${tmp_dir}" -name "*.status")" ]; then
        log "WARNING: No status files found"
        return 1
    fi

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
    <title>taniainteractive Status</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .operational { color: green; }
        .disrupted { color: red; }
        .incident { background-color: #f0f0f0; padding: 10px; margin: 5px 0; border-left: 4px solid orange; }
    </style>
</head>
<body>
    <h1>taniainteractive Status</h1>
    
    <h2>Global Status</h2>
    <p class="${global_status}">
        ${global_message}
    </p>

    <h2>Services Status</h2>
    <ul>
EOF

    # Add service statuses
    for status_file in "${tmp_dir}"/*.status; do
        name=$(basename "${status_file}" .status)
        status=$(cat "${status_file}")
        status_class=$(echo "${status}" | tr '[:upper:]' '[:lower:]')
        cat >> "${output_file}" << EOF
        <li>
            ${name}: 
            <span class="${status_class}">
                ${status}
            </span>
        </li>
EOF
    done

    # Add incidents section
    cat >> "${output_file}" << EOF
    </ul>

    <h2>Incidents</h2>
    <div>
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