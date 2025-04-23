// Gestion du formulaire de commande pour La Ferme O'Neil
document.addEventListener('DOMContentLoaded', function() {
    // Prix des produits
    const prices = {
        'salades': 5,
        'tomates': 5,
        'oignons': 5,
        'carottes': 5,
        'fraises': 8,
        'lait': 7,
        'courges': 8,
        'ble': 6,
        'bananes': 7,
        'agaves': 7,
        'pommes': 6,
        'oeufs': 7,
        'fertilisants': 250
    };

    // Animation d'entrée pour les éléments au scroll
    function animateOnScroll() {
        const elementsToAnimate = document.querySelectorAll('.section-header, .product-card, .contact-item, form');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        elementsToAnimate.forEach(element => {
            observer.observe(element);
        });
    }
    
    // Activer les animations au scroll
    animateOnScroll();
    
    // Animation pour les cartes de produits
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) rotate(1deg)';
            this.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
    });

    // Navigation smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
                
                // Update active class in navigation
                document.querySelectorAll('nav a').forEach(navLink => {
                    navLink.classList.remove('active');
                });
                this.classList.add('active');
            }
        });
    });
    
    // Sélectionner tous les inputs de quantité
    const quantityInputs = document.querySelectorAll('.order-products input[type="number"]');
    const totalElement = document.getElementById('total');
    
    // Fonction pour calculer le total
    function calculateTotal() {
        let total = 0;
        
        quantityInputs.forEach(input => {
            const productName = input.id;
            const quantity = parseInt(input.value) || 0;
            const price = prices[productName] || 0;
            
            total += quantity * price;
            
            // Mettre à jour l'apparence des éléments de commande
            const orderItem = input.closest('.order-item');
            if (quantity > 0) {
                orderItem.style.backgroundColor = 'rgba(74, 124, 89, 0.15)';
                orderItem.style.transform = 'translateX(5px)';
            } else {
                orderItem.style.backgroundColor = '';
                orderItem.style.transform = '';
            }
        });
        
        // Animation du total
        const currentTotal = parseInt(totalElement.textContent) || 0;
        animateValue(totalElement, currentTotal, total, 500);
    }
    
    // Fonction pour animer un changement de valeur
    function animateValue(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            element.textContent = value;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
    
    // Mettre à jour le total quand une quantité change
    quantityInputs.forEach(input => {
        input.addEventListener('change', calculateTotal);
        input.addEventListener('input', calculateTotal);
    });
    
    // Configurer la soumission du formulaire
    const orderForm = document.getElementById('order-form');
    
    if (orderForm) {
        orderForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Récupérer les données du formulaire
            const formData = new FormData(orderForm);
            const orderData = {
                name: formData.get('name'),
                phone: formData.get('phone'),
                discord: formData.get('discord'),
                comments: formData.get('comments'),
                products: {},
                total: parseInt(totalElement.textContent)
            };
            
            // Vérifier que l'ID Discord est fourni
            if (!orderData.discord) {
                showNotification('⚠️ Veuillez fournir votre ID Discord pour recevoir les notifications.', 'error');
                return;
            }
            
            // Récupérer les quantités de produits
            let hasProducts = false;
            
            quantityInputs.forEach(input => {
                const productName = input.id;
                const quantity = parseInt(input.value) || 0;
                
                if (quantity > 0) {
                    orderData.products[productName] = quantity;
                    hasProducts = true;
                }
            });
            
            // Vérifier si au moins un produit a été sélectionné
            if (!hasProducts) {
                showNotification('⚠️ Veuillez sélectionner au moins un produit.', 'error');
                return;
            }
            
            // Afficher un indicateur de chargement
            const submitButton = orderForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = 'Envoi en cours...';
            
            // Envoyer la commande au webhook Discord
            sendOrderToDiscord(orderData).then(() => {
                // Réinitialiser le bouton après l'envoi
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            }).catch(() => {
                // Réinitialiser le bouton en cas d'erreur
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            });
        });
    }
    
    // Fonction pour envoyer la commande au webhook Discord
    function sendOrderToDiscord(orderData) {
        // URL du webhook Discord - configurée pour le bot local
        const webhookUrl = 'http://localhost:3001/api/commande';
        
        // Retourner la promesse pour permettre l'enchaînement then/catch
        return new Promise((resolve, reject) => {
            // Envoyer les données au serveur
            fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData)
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(errorData => {
                        // Si le serveur renvoie un message d'erreur spécifique, l'utiliser
                        const errorMessage = errorData.error || 'Une erreur est survenue lors de l\'envoi de votre commande.';
                        showNotification(`❌ ${errorMessage}`, 'error');
                        console.error('Erreur de réponse:', response.status, errorMessage);
                        reject(new Error(errorMessage));
                    }).catch(() => {
                        // Si la réponse n'est pas au format JSON
                        showNotification('❌ Une erreur est survenue lors de l\'envoi de votre commande. Veuillez réessayer plus tard.', 'error');
                        console.error('Erreur de réponse non-JSON:', response.status);
                        reject(new Error('Erreur de réponse'));
                    });
                }
                
                // Réponse OK, on parse le JSON
                return response.json().then(data => {
                    showNotification('✅ Votre commande a été envoyée ! Vous recevrez bientôt un message privé sur Discord avec les détails.', 'success');
                    orderForm.reset();
                    calculateTotal();
                    resolve(data);
                });
            })
            .catch(error => {
                console.error('Erreur réseau:', error);
                showNotification('❌ Une erreur de connexion est survenue. Veuillez vérifier votre connexion et réessayer.', 'error');
                reject(error);
            });
        });
    }
    
    // Fonction pour formater les noms des produits
    function formatProductName(productName) {
        const nameMap = {
            'salades': 'Salades',
            'tomates': 'Tomates',
            'oignons': 'Oignons',
            'carottes': 'Carottes',
            'fraises': 'Fraises',
            'lait': 'Lait',
            'courges': 'Courges',
            'ble': 'Blé',
            'bananes': 'Bananes',
            'agaves': 'Agaves',
            'pommes': 'Pommes de terres',
            'oeufs': 'Œufs',
            'fertilisants': 'Fertilisants'
        };
        
        return nameMap[productName] || productName;
    }
    
    // Fonction pour afficher des notifications
    function showNotification(message, type = 'info') {
        // Créer l'élément de notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Ajouter la notification au body
        document.body.appendChild(notification);
        
        // Animation d'entrée
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        }, 10);
        
        // Supprimer après quelques secondes
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';
            
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 5000);
    }
    
    // Injecter le CSS pour les notifications
    const notificationStyles = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 5px;
            background-color: #333;
            color: white;
            font-weight: 600;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            transform: translateX(100%);
            opacity: 0;
            transition: all 0.3s ease;
            max-width: 300px;
        }
        
        .notification.success {
            background-color: #4a7c59;
        }
        
        .notification.error {
            background-color: #c74343;
        }
        
        .notification.info {
            background-color: #3498db;
        }
    `;
    
    const styleElement = document.createElement('style');
    styleElement.textContent = notificationStyles;
    document.head.appendChild(styleElement);
});