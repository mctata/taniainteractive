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

# Incident parsing function
process_incidents() {
    log "Processing incidents from incidents.txt"
    local total_incidents=0
    local output_file="${1}"

    # Check if file exists and is readable
    if [ ! -f "incidents.txt" ]; then
        log "ERROR: incidents.txt not found"
        echo "<p>No incidents file found</p>" >> "${output_file}"
        return 1
    fi

    # Log the entire content of incidents.txt for debugging
    log "Incidents file contents:"
    cat incidents.txt | while IFS= read -r incident; do
        log "Found incident: ${incident}"
        ((total_incidents++))
        if [ -n "${incident}" ]; then
            cat >> "${output_file}" << EOF
                <div class="incident">
                    <p>${incident}</p>
                </div>
EOF
        fi
    done

    log "Total incidents processed: ${total_incidents}"

    # If no incidents found, add default message
    if [ "${total_incidents}" -eq 0 ]; then
        cat >> "${output_file}" << EOF
                <p>No active incidents</p>
EOF
    fi
}

# Rest of the script remains the same as in the previous version
# (Generate Status Page, Main Execution functions)
# Only change is to replace the incidents section with:
process_incidents "${output_file}"

# Remaining script stays the same