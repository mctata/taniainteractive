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
            # HTTP/HTTPS check with detailed error handling
            local response
            response=$(curl -${ipversion}sSkL -o /dev/null -w "%{http_code}" \
                -H "User-Agent: taniainteractive Status Monitor" \
                -m 10 "${host}" 2>"${tmp_dir}/${name}.error" || echo "0")
            
            rc="${response}"
            
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

# [Rest of the script remains the same as in the previous version]
# ... (including generate_status_page and main functions)
