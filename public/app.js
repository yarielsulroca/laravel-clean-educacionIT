// Configuración de la API
const API_BASE_URL = 'http://localhost:8001';

// Estado global de la aplicación
let currentUser = null;
let authToken = localStorage.getItem('authToken');

// Elementos del DOM
const loginSection = document.getElementById('loginSection');
const registerSection = document.getElementById('registerSection');
const dashboardSection = document.getElementById('dashboardSection');
const userInfo = document.getElementById('userInfo');
const userName = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');

// Formularios
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// Navegación
const navItems = document.querySelectorAll('.nav-item');
const tabContents = document.querySelectorAll('.tab-content');

// Modales
const addUserModal = document.getElementById('addUserModal');
const addProductModal = document.getElementById('addProductModal');
const addUserBtn = document.getElementById('addUserBtn');
const addProductBtn = document.getElementById('addProductBtn');

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

// Inicializar aplicación
function initializeApp() {
    if (authToken) {
        // Verificar si el token es válido
        checkAuthStatus();
    } else {
        showLoginSection();
    }
}

// Configurar event listeners
function setupEventListeners() {
    // Login y registro
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    
    // Navegación entre formularios
    document.getElementById('showRegister').addEventListener('click', showRegisterSection);
    document.getElementById('showLogin').addEventListener('click', showLoginSection);
    
    // Logout
    logoutBtn.addEventListener('click', handleLogout);
    
    // Navegación del dashboard
    navItems.forEach(item => {
        item.addEventListener('click', () => switchTab(item.dataset.tab));
    });
    
    // Botones de modales
    addUserBtn.addEventListener('click', () => showModal(addUserModal));
    addProductBtn.addEventListener('click', () => showModal(addProductModal));
    
    // Cerrar modales
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => hideAllModals());
    });
    
    // Formularios de modales
    document.getElementById('addUserForm').addEventListener('submit', handleAddUser);
    document.getElementById('addProductForm').addEventListener('submit', handleAddProduct);
    
    // Búsqueda y filtros
    document.getElementById('productSearch').addEventListener('input', handleProductSearch);
    document.getElementById('categoryFilter').addEventListener('change', handleCategoryFilter);
    
    // Cerrar modales al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            hideAllModals();
        }
    });
}

// Funciones de autenticación
async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(loginForm);
    const email = formData.get('email');
    const password = formData.get('password');
    
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            authToken = data.data.token;
            currentUser = data.data.user;
            
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('userData', JSON.stringify(currentUser));
            
            showToast('Login exitoso!', 'success');
            showDashboard();
            loadDashboardData();
        } else {
            showToast(data.error || 'Error en el login', 'error');
        }
    } catch (error) {
        console.error('Error en login:', error);
        showToast('Error de conexión', 'error');
    } finally {
        showLoading(false);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const formData = new FormData(registerForm);
    const userData = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        role: formData.get('role')
    };
    
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Usuario registrado exitosamente!', 'success');
            showLoginSection();
            registerForm.reset();
        } else {
            showToast(data.error || 'Error en el registro', 'error');
        }
    } catch (error) {
        console.error('Error en registro:', error);
        showToast('Error de conexión', 'error');
    } finally {
        showLoading(false);
    }
}

async function checkAuthStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            currentUser = data.data;
            showDashboard();
            loadDashboardData();
        } else {
            // Token inválido
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            authToken = null;
            currentUser = null;
            showLoginSection();
        }
    } catch (error) {
        console.error('Error verificando autenticación:', error);
        showLoginSection();
    }
}

function handleLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    authToken = null;
    currentUser = null;
    showLoginSection();
    showToast('Sesión cerrada', 'info');
}

// Funciones de navegación
function showLoginSection() {
    loginSection.style.display = 'flex';
    registerSection.style.display = 'none';
    dashboardSection.style.display = 'none';
}

function showRegisterSection() {
    loginSection.style.display = 'none';
    registerSection.style.display = 'flex';
    dashboardSection.style.display = 'none';
}

function showDashboard() {
    loginSection.style.display = 'none';
    registerSection.style.display = 'none';
    dashboardSection.style.display = 'flex';
    
    // Mostrar información del usuario
    userName.textContent = currentUser.name;
    userInfo.style.display = 'flex';
    
    // Cargar datos iniciales
    loadDashboardData();
}

function switchTab(tabName) {
    // Actualizar navegación
    navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.tab === tabName);
    });
    
    // Mostrar contenido correspondiente
    tabContents.forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}Tab`);
    });
    
    // Cargar datos según la pestaña
    switch(tabName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'users':
            loadUsers();
            break;
        case 'products':
            loadProducts();
            break;
    }
}

// Funciones de carga de datos
async function loadDashboardData() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/products/dashboard`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            updateDashboardStats(data.data);
        }
    } catch (error) {
        console.error('Error cargando dashboard:', error);
    }
}

async function loadUsers() {
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE_URL}/api/users`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            renderUsersTable(data.data);
        }
    } catch (error) {
        console.error('Error cargando usuarios:', error);
        showToast('Error cargando usuarios', 'error');
    } finally {
        showLoading(false);
    }
}

async function loadProducts() {
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE_URL}/api/products`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            renderProductsTable(data.data);
            updateCategoryFilter(data.data);
        }
    } catch (error) {
        console.error('Error cargando productos:', error);
        showToast('Error cargando productos', 'error');
    } finally {
        showLoading(false);
    }
}

// Funciones de renderizado
function updateDashboardStats(stats) {
    document.getElementById('totalUsers').textContent = stats.totalUsers || 0;
    document.getElementById('totalProducts').textContent = stats.totalProducts || 0;
    document.getElementById('lowStockProducts').textContent = stats.lowStockProducts || 0;
    document.getElementById('expensiveProducts').textContent = stats.expensiveProducts || 0;
}

function renderUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td><span class="badge badge-${user.role === 'admin' ? 'danger' : 'info'}">${user.role}</span></td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editUser(${user.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderProductsTable(products) {
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = '';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${product.description.substring(0, 50)}${product.description.length > 50 ? '...' : ''}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td><span class="badge badge-${product.stock < 10 ? 'danger' : 'success'}">${product.stock}</span></td>
            <td>${product.category}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editProduct(${product.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateCategoryFilter(products) {
    const categories = [...new Set(products.map(p => p.category))];
    const select = document.getElementById('categoryFilter');
    
    // Mantener la opción "Todas las categorías"
    select.innerHTML = '<option value="">Todas las categorías</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        select.appendChild(option);
    });
}

// Funciones de modales
function showModal(modal) {
    modal.style.display = 'block';
}

function hideAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// Funciones de formularios
async function handleAddUser(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const userData = {
        name: formData.get('modalUserName'),
        email: formData.get('modalUserEmail'),
        password: formData.get('modalUserPassword'),
        role: formData.get('modalUserRole')
    };
    
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE_URL}/api/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Usuario creado exitosamente!', 'success');
            hideAllModals();
            e.target.reset();
            loadUsers();
        } else {
            showToast(data.error || 'Error creando usuario', 'error');
        }
    } catch (error) {
        console.error('Error creando usuario:', error);
        showToast('Error de conexión', 'error');
    } finally {
        showLoading(false);
    }
}

async function handleAddProduct(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const productData = {
        name: formData.get('modalProductName'),
        description: formData.get('modalProductDescription'),
        price: parseFloat(formData.get('modalProductPrice')),
        stock: parseInt(formData.get('modalProductStock')),
        category: formData.get('modalProductCategory')
    };
    
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE_URL}/api/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(productData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Producto creado exitosamente!', 'success');
            hideAllModals();
            e.target.reset();
            loadProducts();
        } else {
            showToast(data.error || 'Error creando producto', 'error');
        }
    } catch (error) {
        console.error('Error creando producto:', error);
        showToast('Error de conexión', 'error');
    } finally {
        showLoading(false);
    }
}

// Funciones de búsqueda y filtros
function handleProductSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#productsTableBody tr');
    
    rows.forEach(row => {
        const name = row.cells[1].textContent.toLowerCase();
        const description = row.cells[2].textContent.toLowerCase();
        
        if (name.includes(searchTerm) || description.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function handleCategoryFilter(e) {
    const selectedCategory = e.target.value;
    const rows = document.querySelectorAll('#productsTableBody tr');
    
    rows.forEach(row => {
        const category = row.cells[5].textContent;
        
        if (!selectedCategory || category === selectedCategory) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Funciones de utilidad
function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    spinner.style.display = show ? 'flex' : 'none';
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'fas fa-check-circle' : 
                 type === 'error' ? 'fas fa-exclamation-circle' : 
                 'fas fa-info-circle';
    
    toast.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

// Funciones de edición y eliminación (placeholder)
function editUser(userId) {
    showToast('Función de edición en desarrollo', 'info');
}

function deleteUser(userId) {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
        showToast('Función de eliminación en desarrollo', 'info');
    }
}

function editProduct(productId) {
    showToast('Función de edición en desarrollo', 'info');
}

function deleteProduct(productId) {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
        showToast('Función de eliminación en desarrollo', 'info');
    }
}

// Estilos adicionales para badges
const style = document.createElement('style');
style.textContent = `
    .badge {
        padding: 0.25rem 0.5rem;
        border-radius: 0.375rem;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    
    .badge-danger {
        background-color: #dc2626;
        color: white;
    }
    
    .badge-success {
        background-color: #16a34a;
        color: white;
    }
    
    .badge-info {
        background-color: #0891b2;
        color: white;
    }
    
    .btn-sm {
        padding: 0.5rem 0.75rem;
        font-size: 0.875rem;
    }
`;
document.head.appendChild(style);
