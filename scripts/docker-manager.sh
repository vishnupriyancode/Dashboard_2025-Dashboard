#!/bin/bash

# Docker Manager for Dashboard 2025
# Works in Git Bash, WSL, Linux, macOS

CONTAINER_NAME="dashboard-app"
IMAGE_NAME="dashboard:latest"
COMPOSE_FILE="docker/docker-compose.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Functions
write_info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

write_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

write_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

write_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

test_docker() {
    if command -v docker &> /dev/null; then
        write_success "Docker is available: $(docker --version)"
        return 0
    else
        write_error "Docker is not available. Please install Docker Desktop."
        return 1
    fi
}

test_docker_compose() {
    if command -v docker-compose &> /dev/null; then
        write_success "Docker Compose is available: $(docker-compose --version)"
        return 0
    else
        write_error "Docker Compose is not available."
        return 1
    fi
}

test_docker_running() {
    if docker info &> /dev/null; then
        write_success "Docker daemon is running"
        return 0
    else
        write_error "Docker daemon is not running. Please start Docker Desktop."
        return 1
    fi
}

test_project_structure() {
    write_info "Checking project structure..."
    
    local missing_files=()
    
    if [[ -f "$COMPOSE_FILE" ]]; then
        write_success "✓ $COMPOSE_FILE"
    else
        write_error "✗ $COMPOSE_FILE (missing)"
        missing_files+=("$COMPOSE_FILE")
    fi
    
    if [[ -f "docker/Dockerfile" ]]; then
        write_success "✓ docker/Dockerfile"
    else
        write_error "✗ docker/Dockerfile (missing)"
        missing_files+=("docker/Dockerfile")
    fi
    
    if [[ -f "scripts/start.sh" ]]; then
        write_success "✓ scripts/start.sh"
    else
        write_error "✗ scripts/start.sh (missing)"
        missing_files+=("scripts/start.sh")
    fi
    
    if [[ -f "frontend/package.json" ]]; then
        write_success "✓ frontend/package.json"
    else
        write_error "✗ frontend/package.json (missing)"
        missing_files+=("frontend/package.json")
    fi
    
    if [[ -f "backend/package.json" ]]; then
        write_success "✓ backend/package.json"
    else
        write_error "✗ backend/package.json (missing)"
        missing_files+=("backend/package.json")
    fi
    
    if [[ ${#missing_files[@]} -gt 0 ]]; then
        write_error "Missing required files: ${missing_files[*]}"
        return 1
    fi
    
    return 0
}

test_ports() {
    write_info "Checking port availability..."
    
    local ports=(3000 5001)
    local conflicts=()
    
    for port in "${ports[@]}"; do
        if netstat -an 2>/dev/null | grep -q ":$port "; then
            write_warning "Port $port is in use"
            conflicts+=("$port")
        else
            write_success "✓ Port $port is available"
        fi
    done
    
    if [[ ${#conflicts[@]} -gt 0 ]]; then
        write_warning "Some ports are in use. You may need to stop conflicting services."
        return 1
    fi
    
    return 0
}

build_dashboard() {
    write_info "Building dashboard Docker image..."
    
    if [[ ! -f "$COMPOSE_FILE" ]]; then
        write_error "Docker Compose file not found at $COMPOSE_FILE"
        return 1
    fi
    
    local compose_dir=$(dirname "$COMPOSE_FILE")
    cd "$compose_dir" || return 1
    
    write_info "Building Docker image (this may take several minutes)..."
    if docker-compose build --no-cache; then
        write_success "Dashboard image built successfully!"
        cd - > /dev/null || return 1
        return 0
    else
        write_error "Failed to build dashboard image"
        cd - > /dev/null || return 1
        return 1
    fi
}

start_dashboard() {
    write_info "Starting dashboard application..."
    
    if [[ ! -f "$COMPOSE_FILE" ]]; then
        write_error "Docker Compose file not found at $COMPOSE_FILE"
        return 1
    fi
    
    local compose_dir=$(dirname "$COMPOSE_FILE")
    cd "$compose_dir" || return 1
    
    if docker-compose up -d; then
        write_success "Dashboard started successfully!"
        write_info "Frontend: http://localhost:3000"
        write_info "Backend API: http://localhost:5001"
        cd - > /dev/null || return 1
        return 0
    else
        write_error "Failed to start dashboard"
        cd - > /dev/null || return 1
        return 1
    fi
}

stop_dashboard() {
    write_info "Stopping dashboard application..."
    
    if [[ ! -f "$COMPOSE_FILE" ]]; then
        write_error "Docker Compose file not found at $COMPOSE_FILE"
        return 1
    fi
    
    local compose_dir=$(dirname "$COMPOSE_FILE")
    cd "$compose_dir" || return 1
    
    if docker-compose down; then
        write_success "Dashboard stopped successfully!"
        cd - > /dev/null || return 1
        return 0
    else
        write_error "Failed to stop dashboard"
        cd - > /dev/null || return 1
        return 1
    fi
}

restart_dashboard() {
    write_info "Restarting dashboard application..."
    stop_dashboard
    sleep 2
    start_dashboard
}

show_logs() {
    write_info "Showing dashboard logs..."
    
    if [[ ! -f "$COMPOSE_FILE" ]]; then
        write_error "Docker Compose file not found at $COMPOSE_FILE"
        return 1
    fi
    
    local compose_dir=$(dirname "$COMPOSE_FILE")
    cd "$compose_dir" || return 1
    
    docker-compose logs -f
    cd - > /dev/null || return 1
}

show_status() {
    write_info "Dashboard Status:"
    echo "================="
    
    local container_status
    container_status=$(docker ps -a --filter "name=$CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null)
    
    if [[ -n "$container_status" ]]; then
        echo "$container_status"
    else
        write_warning "Container does not exist"
    fi
    
    echo ""
    echo "Ports:"
    echo "Frontend: http://localhost:3000"
    echo "Backend:  http://localhost:5001"
}

clean_docker() {
    write_info "Cleaning up Docker resources..."
    
    docker stop "$CONTAINER_NAME" 2>/dev/null || true
    docker rm "$CONTAINER_NAME" 2>/dev/null || true
    docker rmi "$IMAGE_NAME" 2>/dev/null || true
    docker system prune -f
    
    write_success "Docker cleanup completed!"
}

enter_shell() {
    write_info "Entering dashboard container shell..."
    
    if docker ps --filter "name=$CONTAINER_NAME" --format "{{.Names}}" | grep -q "$CONTAINER_NAME"; then
        docker exec -it "$CONTAINER_NAME" /bin/sh
    else
        write_error "Container is not running. Start it first with: ./scripts/docker-manager.sh start"
    fi
}

run_tests() {
    write_info "Running comprehensive Docker setup test..."
    
    local tests=(
        "Docker Installation:test_docker"
        "Docker Compose:test_docker_compose"
        "Docker Daemon:test_docker_running"
        "Project Structure:test_project_structure"
        "Port Availability:test_ports"
    )
    
    local passed=0
    local total=${#tests[@]}
    
    for test in "${tests[@]}"; do
        local test_name="${test%:*}"
        local test_func="${test#*:}"
        
        echo ""
        echo "--- Testing: $test_name ---"
        if $test_func; then
            ((passed++))
        fi
    done
    
    echo ""
    echo "=== Test Summary ==="
    if [[ $passed -eq $total ]]; then
        write_success "All tests passed! Docker setup is ready."
        write_info "Next steps:"
        write_info "1. Run: ./scripts/docker-manager.sh build"
        write_info "2. Run: ./scripts/docker-manager.sh start"
    else
        write_error "Some tests failed. Please fix the issues above before proceeding."
    fi
}

# Main execution
main() {
    echo "=== Docker Manager for Dashboard 2025 ==="
    echo ""
    
    # Check if Docker is available
    if ! test_docker; then
        exit 1
    fi
    
    # Parse command line arguments
    case "${1:-status}" in
        "test")
            run_tests
            ;;
        "build")
            build_dashboard
            ;;
        "start")
            start_dashboard
            ;;
        "stop")
            stop_dashboard
            ;;
        "restart")
            restart_dashboard
            ;;
        "logs")
            show_logs
            ;;
        "status")
            show_status
            ;;
        "clean")
            clean_docker
            ;;
        "shell")
            enter_shell
            ;;
        *)
            echo "Usage: $0 [test|build|start|stop|restart|logs|status|clean|shell]"
            echo ""
            echo "Commands:"
            echo "  test    - Run comprehensive Docker setup test"
            echo "  build   - Build the Docker image"
            echo "  start   - Start the dashboard"
            echo "  stop    - Stop the dashboard"
            echo "  restart - Restart the dashboard"
            echo "  logs    - Show logs"
            echo "  status  - Show status (default)"
            echo "  clean   - Clean up Docker resources"
            echo "  shell   - Enter container shell"
            echo ""
            show_status
            ;;
    esac
}

# Run main function with all arguments
main "$@"
