#!/usr/bin/env bash

# Enhanced Status Monitoring Script for Tania Interactive

# Strict mode for better error handling
set -euo pipefail

# Configuration
CONFIG_DIR="$(dirname "$0")"
CHECKS_FILE="${CONFIG_DIR}/checks.csv"
INCIDENTS_FILE="${CONFIG_DIR}/incidents.txt"
OUTPUT_DIR="${CONFIG_DIR}"
LOG_DIR="${CONFIG_DIR}/logs"
HISTORY_DIR="${OUTPUT_DIR}/history"

# Create necessary directories
mkdir -p "${OUTPUT_DIR}" "${LOG_DIR}" "${HISTORY_DIR}"

# Logging function
log() {
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] $*" | tee -a "${LOG_DIR}/status_monitor.log"
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

    # Determine IP version
    [[ "${check}" =~ [46]$ ]] && ipversion="${BASH_REMATCH[0]}"

    case "${check}" in
        http*)
            # HTTP/HTTPS check
            rc=$(curl -${ipversion}sSkLo /dev/null -H "User-Agent: Mozilla/5.0" -m 10 -w "%{http_code}" "${host}" 2>"${tmp_dir}/${name}.error")
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
        log "Service ${name} is disrupted"
        cat "${tmp_dir}/${name}.error" >> "${LOG_DIR}/service_errors.log"
    fi
}

# Generate HTML status page
generate_status_page() {
    local tmp_dir="${1}"
    local output_file="${OUTPUT_DIR}/index.html"
    local history_file="${HISTORY_DIR}/status_$(date +%Y%m%d_%H%M%S).html"

    # Start HTML generation
    cat > "${output_file}" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Tania Interactive Status</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .status-header { display: flex; justify-content: space-between; align-items: center; }
        .status-badge { padding: 10px; border-radius: 5px; }
        .operational { background-color: #4CAF50; color: white; }
        .disrupted { background-color: #F44336; color: white; }
        .service-list { list-style-type: none; padding: 0; }
        .service-item { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #ddd; }
    </style>
</head>
<body>
    <div class="status-container">
        <div class="status-header">
            <h1>Tania Interactive Status</h1>
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

    <h2>Incidents</h2>
    $([ -s "${INCIDENTS_FILE}" ] && sed 's/^/<p>/' "${INCIDENTS_FILE}" | sed 's/$/<\/p>/' || echo "<p>No active incidents</p>")
</body>
</html>
EOF

    # Copy to history
    cp "${output_file}" "${history_file}"
}

# Main execution
main() {
    check_dependencies

    # Create temporary directory
    tmp_dir=$(mktemp -d)

    # Perform service checks
    id=0
    while IFS=$'\n' read -r line; do
        check=$(get_field "${line}" 1)
        code=$(get_field "${line}" 2)
        name=$(get_field "${line}" 3)
        host=$(get_field "${line}" 4)
        check_service "${check}" "${host}" "${name}" "${code}" "${tmp_dir}" &
        : $((id++))
    done < "${CHECKS_FILE}"
    wait

    # Generate status page
    generate_status_page "${tmp_dir}"

    # Cleanup
    rm -rf "${tmp_dir}"
}

# Execute main function
main