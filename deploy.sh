#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Fünf Giebel Deployment Script (MicroK8s) ===${NC}"

# Detect kubectl command (microk8s kubectl or plain kubectl)
if command -v microk8s &> /dev/null; then
    KUBECTL="microk8s kubectl"
elif command -v kubectl &> /dev/null; then
    KUBECTL="kubectl"
else
    echo -e "${RED}Error: Neither microk8s nor kubectl found${NC}"
    exit 1
fi

# Check prerequisites
check_prerequisites() {
    echo -e "\n${YELLOW}Checking prerequisites...${NC}"

    if ! command -v microk8s &> /dev/null; then
        echo -e "${RED}Error: MicroK8s is not installed${NC}"
        echo -e "${YELLOW}Install: sudo snap install microk8s --classic${NC}"
        exit 1
    fi

    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Error: Docker is not installed${NC}"
        exit 1
    fi

    # Check if MicroK8s is running
    if ! microk8s status --wait-ready &> /dev/null; then
        echo -e "${YELLOW}Starting MicroK8s...${NC}"
        microk8s start
        microk8s status --wait-ready
    fi

    echo -e "${GREEN}Prerequisites OK${NC}"
}

# Enable ingress addon
enable_ingress() {
    echo -e "\n${YELLOW}Enabling ingress addon...${NC}"

    if microk8s status | grep -q "ingress: enabled"; then
        echo -e "${GREEN}Ingress already enabled${NC}"
    else
        microk8s enable ingress
        echo -e "${GREEN}Ingress addon enabled${NC}"
        echo -e "${YELLOW}Waiting for ingress controller...${NC}"
        sleep 10
    fi
}

# Build Docker image
build_image() {
    echo -e "\n${YELLOW}Building Docker image...${NC}"

    docker build -t fuenfgiebel:latest .

    echo -e "${YELLOW}Importing image to MicroK8s...${NC}"
    docker save fuenfgiebel:latest | microk8s ctr image import -

    echo -e "${GREEN}Docker image built and imported${NC}"
}

# Apply Kubernetes manifests
apply_manifests() {
    echo -e "\n${YELLOW}Applying Kubernetes manifests...${NC}"

    # Apply in order
    $KUBECTL apply -f k8s/namespace.yaml
    $KUBECTL apply -f k8s/configmap.yaml
    $KUBECTL apply -f k8s/secret.yaml
    # pvc.yaml not needed - using hostPath instead
    $KUBECTL apply -f k8s/deployment.yaml
    $KUBECTL apply -f k8s/service.yaml
    $KUBECTL apply -f k8s/ingress.yaml

    echo -e "${GREEN}Manifests applied${NC}"
}

# Wait for deployment
wait_for_deployment() {
    echo -e "\n${YELLOW}Waiting for deployment to be ready...${NC}"
    $KUBECTL rollout status deployment/fuenfgiebel -n fuenfgiebel --timeout=120s
    echo -e "${GREEN}Deployment ready${NC}"
}

# Show access information
show_access_info() {
    echo -e "\n${GREEN}=== Deployment Complete ===${NC}"

    # Get server IP
    SERVER_IP=$(hostname -I | awk '{print $1}')

    echo -e "\n${YELLOW}Access the application:${NC}"
    echo -e "Via Ingress (Port 80):"
    echo -e "  http://${SERVER_IP}"
    echo -e ""
    echo -e "Note: Port 80 might require sudo access for ingress."
    echo -e "If ingress is not working, check: microk8s kubectl get ingress -n fuenfgiebel"
    echo -e ""
    echo -e "${YELLOW}Data directory:${NC}"
    echo -e "  /srv/fuenfgiebel/data"
    echo -e ""
    echo -e "${YELLOW}Useful commands:${NC}"
    echo -e "  $KUBECTL get pods -n fuenfgiebel"
    echo -e "  $KUBECTL logs -f deployment/fuenfgiebel -n fuenfgiebel"
    echo -e "  $KUBECTL exec -it deployment/fuenfgiebel -n fuenfgiebel -- sh"
}

# Main
main() {
    case "${1:-deploy}" in
        build)
            check_prerequisites
            build_image
            ;;
        apply)
            check_prerequisites
            apply_manifests
            wait_for_deployment
            show_access_info
            ;;
        deploy)
            check_prerequisites
            enable_ingress
            build_image
            apply_manifests
            wait_for_deployment
            show_access_info
            ;;
        status)
            $KUBECTL get all -n fuenfgiebel
            ;;
        logs)
            $KUBECTL logs -f deployment/fuenfgiebel -n fuenfgiebel
            ;;
        delete)
            echo -e "${YELLOW}Deleting deployment...${NC}"
            $KUBECTL delete namespace fuenfgiebel --ignore-not-found
            echo -e "${GREEN}Deployment deleted${NC}"
            ;;
        *)
            echo "Usage: $0 {build|apply|deploy|status|logs|delete}"
            echo ""
            echo "Commands:"
            echo "  build   - Build Docker image only"
            echo "  apply   - Apply K8s manifests only"
            echo "  deploy  - Full deployment (build + apply)"
            echo "  status  - Show deployment status"
            echo "  logs    - Follow application logs"
            echo "  delete  - Delete deployment"
            exit 1
            ;;
    esac
}

main "$@"
