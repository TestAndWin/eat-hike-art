#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Fünf Giebel Deployment Script ===${NC}"

# Check prerequisites
check_prerequisites() {
    echo -e "\n${YELLOW}Checking prerequisites...${NC}"

    if ! command -v minikube &> /dev/null; then
        echo -e "${RED}Error: minikube is not installed${NC}"
        exit 1
    fi

    if ! command -v kubectl &> /dev/null; then
        echo -e "${RED}Error: kubectl is not installed${NC}"
        exit 1
    fi

    # Check if minikube is running
    if ! minikube status | grep -q "Running"; then
        echo -e "${YELLOW}Starting minikube...${NC}"
        minikube start
    fi

    echo -e "${GREEN}Prerequisites OK${NC}"
}

# Enable ingress addon
enable_ingress() {
    echo -e "\n${YELLOW}Enabling ingress addon...${NC}"
    minikube addons enable ingress
    echo -e "${GREEN}Ingress addon enabled${NC}"
}

# Build Docker image
build_image() {
    echo -e "\n${YELLOW}Building Docker image...${NC}"

    # Use minikube's Docker daemon
    eval $(minikube docker-env)

    docker build -t fuenfgiebel:latest .

    echo -e "${GREEN}Docker image built${NC}"
}

# Apply Kubernetes manifests
apply_manifests() {
    echo -e "\n${YELLOW}Applying Kubernetes manifests...${NC}"

    # Apply in order
    kubectl apply -f k8s/namespace.yaml
    kubectl apply -f k8s/configmap.yaml
    kubectl apply -f k8s/secret.yaml
    # pvc.yaml not needed - using hostPath instead
    kubectl apply -f k8s/deployment.yaml
    kubectl apply -f k8s/service.yaml
    kubectl apply -f k8s/ingress.yaml

    echo -e "${GREEN}Manifests applied${NC}"
}

# Wait for deployment
wait_for_deployment() {
    echo -e "\n${YELLOW}Waiting for deployment to be ready...${NC}"
    kubectl rollout status deployment/fuenfgiebel -n fuenfgiebel --timeout=120s
    echo -e "${GREEN}Deployment ready${NC}"
}

# Show access information
show_access_info() {
    echo -e "\n${GREEN}=== Deployment Complete ===${NC}"

    MINIKUBE_IP=$(minikube ip)

    echo -e "\n${YELLOW}Access the application:${NC}"
    echo -e "1. Add to /etc/hosts:"
    echo -e "   ${MINIKUBE_IP} fuenfgiebel.local"
    echo -e ""
    echo -e "2. Open in browser:"
    echo -e "   http://fuenfgiebel.local"
    echo -e ""
    echo -e "Or use minikube tunnel (requires sudo):"
    echo -e "   sudo minikube tunnel"
    echo -e ""
    echo -e "${YELLOW}Useful commands:${NC}"
    echo -e "   kubectl get pods -n fuenfgiebel"
    echo -e "   kubectl logs -f deployment/fuenfgiebel -n fuenfgiebel"
    echo -e "   kubectl exec -it deployment/fuenfgiebel -n fuenfgiebel -- sh"
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
            kubectl get all -n fuenfgiebel
            ;;
        logs)
            kubectl logs -f deployment/fuenfgiebel -n fuenfgiebel
            ;;
        delete)
            echo -e "${YELLOW}Deleting deployment...${NC}"
            kubectl delete namespace fuenfgiebel --ignore-not-found
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
