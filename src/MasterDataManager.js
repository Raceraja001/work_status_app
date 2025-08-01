import React, { useState, useEffect } from 'react';

const MasterDataManager = ({ selectedBackend, onDataUpdated }) => {
  const [activeTab, setActiveTab] = useState('dropdowns');
  const [masterData, setMasterData] = useState({
    categories: [],
    values: {},
    clients: [],
    employees: [],
    users: []
  });
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const MYSQL_API_URL = 'http://localhost:3002/api/masters';

  useEffect(() => {
    if (selectedBackend === 'mysql') {
      loadMasterData();
    }
  }, [selectedBackend]);

  const loadMasterData = async () => {
    setLoading(true);
    try {
      const [categoriesRes, clientsRes, employeesRes, usersRes] = await Promise.all([
        fetch(`${MYSQL_API_URL}/categories`),
        fetch(`${MYSQL_API_URL}/clients`),
        fetch(`${MYSQL_API_URL}/employees`),
        fetch('http://localhost:3002/api/users')
      ]);

      const [categoriesData, clientsData, employeesData, usersData] = await Promise.all([
        categoriesRes.json(),
        clientsRes.json(),
        employeesRes.json(),
        usersRes.json()
      ]);

      const categories = categoriesData.success ? categoriesData.data : [];
      
      // Load values for each category
      const values = {};
      for (const category of categories) {
        const valuesRes = await fetch(`${MYSQL_API_URL}/values/${category.category_name}`);
        const valuesData = await valuesRes.json();
        values[category.category_name] = valuesData.success ? valuesData.data : [];
      }

      setMasterData({
        categories,
        values,
        clients: clientsData.success ? clientsData.data : [],
        employees: employeesData.success ? employeesData.data : [],
        users: usersData.success ? usersData.data : []
      });
    } catch (error) {
      console.error('Error loading master data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMasterValue = async () => {
    if (!selectedCategory || !newItem.value || !newItem.display_text) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const response = await fetch(`${MYSQL_API_URL}/values`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_name: selectedCategory,
          ...newItem
        })
      });

      const result = await response.json();
      if (result.success) {
        setNewItem({});
        loadMasterData();
        onDataUpdated && onDataUpdated();
        alert('Master value added successfully!');
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      alert('Network error: ' + error.message);
    }
  };

  const addClient = async () => {
    if (!newItem.client_name) {
      alert('Client name is required');
      return;
    }

    try {
      const response = await fetch(`${MYSQL_API_URL}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });

      const result = await response.json();
      if (result.success) {
        setNewItem({});
        loadMasterData();
        onDataUpdated && onDataUpdated();
        alert('Client added successfully!');
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      alert('Network error: ' + error.message);
    }
  };

  const addEmployee = async () => {
    if (!newItem.employee_name) {
      alert('Employee name is required');
      return;
    }

    try {
      const response = await fetch(`${MYSQL_API_URL}/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });

      const result = await response.json();
      if (result.success) {
        setNewItem({});
        loadMasterData();
        onDataUpdated && onDataUpdated();
        alert('Employee added successfully!');
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      alert('Network error: ' + error.message);
    }
  };

  const addUser = async () => {
    if (!newItem.username || !newItem.email || !newItem.password) {
      alert('Username, email, and password are required');
      return;
    }

    try {
      const response = await fetch('http://localhost:3002/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });

      const result = await response.json();
      if (result.success) {
        setNewItem({});
        loadMasterData();
        onDataUpdated && onDataUpdated();
        alert('User created successfully!');
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      alert('Network error: ' + error.message);
    }
  };

  // Generic update function
  const updateItem = async (type, id, data) => {
    try {
      const endpoints = {
        'values': `${MYSQL_API_URL}/values/${id}`,
        'clients': `${MYSQL_API_URL}/clients/${id}`,
        'employees': `${MYSQL_API_URL}/employees/${id}`,
        'users': `http://localhost:3002/api/users/${id}`
      };

      const response = await fetch(endpoints[type], {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (result.success) {
        setShowEditModal(false);
        setEditingItem(null);
        loadMasterData();
        onDataUpdated && onDataUpdated();
        alert(`${type.slice(0, -1)} updated successfully!`);
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      alert('Network error: ' + error.message);
    }
  };

  // Generic delete function
  const deleteItem = async (type, id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      const endpoints = {
        'values': `${MYSQL_API_URL}/values/${id}`,
        'clients': `${MYSQL_API_URL}/clients/${id}`,
        'employees': `${MYSQL_API_URL}/employees/${id}`,
        'users': `http://localhost:3002/api/users/${id}`
      };

      const response = await fetch(endpoints[type], {
        method: 'DELETE'
      });

      const result = await response.json();
      if (result.success) {
        loadMasterData();
        onDataUpdated && onDataUpdated();
        alert(`${type.slice(0, -1)} deleted successfully!`);
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      alert('Network error: ' + error.message);
    }
  };

  const openEditModal = (type, item) => {
    setEditingItem({ ...item, type });
    setShowEditModal(true);
  };

  if (selectedBackend !== 'mysql') {
    return (
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#fff3cd', 
        border: '1px solid #ffeaa7',
        borderRadius: '8px',
        margin: '20px 0'
      }}>
        <h3>🛠️ Master Data Manager</h3>
        <p>Select MySQL backend to manage master data (dropdowns, clients, employees).</p>
      </div>
    );
  }

  return (
    <div style={{ margin: '20px 0' }}>
      <h3>🛠️ Master Data Manager</h3>
      
      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px',
        borderBottom: '2px solid #dee2e6'
      }}>
        {['dropdowns', 'clients', 'employees', 'users'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px',
              border: 'none',
              backgroundColor: activeTab === tab ? '#007bff' : '#f8f9fa',
              color: activeTab === tab ? 'white' : '#495057',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading && <div>Loading master data...</div>}

      {/* Dropdown Values Tab */}
      {activeTab === 'dropdowns' && (
        <div>
          <h4>Manage Dropdown Values</h4>
          
          {/* Add New Value Form */}
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <h5>Add New Dropdown Value</h5>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="">Select Category</option>
                {masterData.categories.map(cat => (
                  <option key={cat.id} value={cat.category_name}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Value"
                value={newItem.value || ''}
                onChange={(e) => setNewItem({...newItem, value: e.target.value})}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
              <input
                type="text"
                placeholder="Display Text"
                value={newItem.display_text || ''}
                onChange={(e) => setNewItem({...newItem, display_text: e.target.value})}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
              <input
                type="color"
                placeholder="Color Code"
                value={newItem.color_code || '#000000'}
                onChange={(e) => setNewItem({...newItem, color_code: e.target.value})}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
              <button
                onClick={addMasterValue}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Add Value
              </button>
            </div>
          </div>

          {/* Display Existing Values */}
          {Object.entries(masterData.values).map(([categoryName, values]) => (
            <div key={categoryName} style={{ marginBottom: '20px' }}>
              <h5>{categoryName}</h5>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {values.map(value => (
                  <div
                    key={value.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '6px 12px',
                      backgroundColor: value.color_code || '#e9ecef',
                      color: value.color_code ? 'white' : 'black',
                      borderRadius: '16px',
                      fontSize: '0.9rem'
                    }}
                  >
                    <span>{value.display_text}</span>
                    <button
                      onClick={() => openEditModal('values', value)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'inherit',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => deleteItem('values', value.id, value.display_text)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'inherit',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Clients Tab */}
      {activeTab === 'clients' && (
        <div>
          <h4>Manage Clients</h4>
          
          {/* Add New Client Form */}
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <h5>Add New Client</h5>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              <input
                type="text"
                placeholder="Client Name *"
                value={newItem.client_name || ''}
                onChange={(e) => setNewItem({...newItem, client_name: e.target.value})}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
              <input
                type="text"
                placeholder="Client Code"
                value={newItem.client_code || ''}
                onChange={(e) => setNewItem({...newItem, client_code: e.target.value})}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
              <input
                type="text"
                placeholder="Contact Person"
                value={newItem.contact_person || ''}
                onChange={(e) => setNewItem({...newItem, contact_person: e.target.value})}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
              <input
                type="email"
                placeholder="Email"
                value={newItem.email || ''}
                onChange={(e) => setNewItem({...newItem, email: e.target.value})}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
              <button
                onClick={addClient}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Add Client
              </button>
            </div>
          </div>

          {/* Display Existing Clients */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
            {masterData.clients.map(client => (
              <div
                key={client.id}
                style={{
                  padding: '15px',
                  backgroundColor: 'white',
                  border: '1px solid #dee2e6',
                  borderRadius: '8px'
                }}
              >
                <h6 style={{ margin: '0 0 10px 0', color: '#007bff' }}>
                  {client.client_name} ({client.client_code})
                </h6>
                <div style={{ fontSize: '0.9rem', color: '#6c757d', marginBottom: '10px' }}>
                  <div>Contact: {client.contact_person}</div>
                  <div>Email: {client.email}</div>
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button
                    onClick={() => openEditModal('clients', client)}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => deleteItem('clients', client.id, client.client_name)}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Employees Tab */}
      {activeTab === 'employees' && (
        <div>
          <h4>Manage Employees</h4>
          
          {/* Add New Employee Form */}
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <h5>Add New Employee</h5>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              <input
                type="text"
                placeholder="Employee Name *"
                value={newItem.employee_name || ''}
                onChange={(e) => setNewItem({...newItem, employee_name: e.target.value})}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
              <input
                type="text"
                placeholder="Employee Code"
                value={newItem.employee_code || ''}
                onChange={(e) => setNewItem({...newItem, employee_code: e.target.value})}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
              <input
                type="email"
                placeholder="Email"
                value={newItem.email || ''}
                onChange={(e) => setNewItem({...newItem, email: e.target.value})}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
              <input
                type="text"
                placeholder="Department"
                value={newItem.department || ''}
                onChange={(e) => setNewItem({...newItem, department: e.target.value})}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
              <input
                type="text"
                placeholder="Designation"
                value={newItem.designation || ''}
                onChange={(e) => setNewItem({...newItem, designation: e.target.value})}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
              <button
                onClick={addEmployee}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Add Employee
              </button>
            </div>
          </div>

          {/* Display Existing Employees */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
            {masterData.employees.map(employee => (
              <div
                key={employee.id}
                style={{
                  padding: '15px',
                  backgroundColor: 'white',
                  border: '1px solid #dee2e6',
                  borderRadius: '8px'
                }}
              >
                <h6 style={{ margin: '0 0 10px 0', color: '#007bff' }}>
                  {employee.employee_name} ({employee.employee_code})
                </h6>
                <div style={{ fontSize: '0.9rem', color: '#6c757d', marginBottom: '10px' }}>
                  <div>Department: {employee.department}</div>
                  <div>Designation: {employee.designation}</div>
                  <div>Email: {employee.email}</div>
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button
                    onClick={() => openEditModal('employees', employee)}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => deleteItem('employees', employee.id, employee.employee_name)}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          <h4>Manage Users</h4>
          
          {/* Add New User Form */}
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <h5>Add New User</h5>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              <input
                type="text"
                placeholder="Username *"
                value={newItem.username || ''}
                onChange={(e) => setNewItem({...newItem, username: e.target.value})}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
              <input
                type="email"
                placeholder="Email *"
                value={newItem.email || ''}
                onChange={(e) => setNewItem({...newItem, email: e.target.value})}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
              <input
                type="password"
                placeholder="Password *"
                value={newItem.password || ''}
                onChange={(e) => setNewItem({...newItem, password: e.target.value})}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
              <input
                type="text"
                placeholder="First Name"
                value={newItem.first_name || ''}
                onChange={(e) => setNewItem({...newItem, first_name: e.target.value})}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
              <input
                type="text"
                placeholder="Last Name"
                value={newItem.last_name || ''}
                onChange={(e) => setNewItem({...newItem, last_name: e.target.value})}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
              <select
                value={newItem.role || 'user'}
                onChange={(e) => setNewItem({...newItem, role: e.target.value})}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="user">User</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
                <option value="viewer">Viewer</option>
              </select>
              <input
                type="text"
                placeholder="Department"
                value={newItem.department || ''}
                onChange={(e) => setNewItem({...newItem, department: e.target.value})}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
              <button
                onClick={addUser}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Add User
              </button>
            </div>
          </div>

          {/* Display Existing Users */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '15px' }}>
            {masterData.users.map(user => (
              <div
                key={user.id}
                style={{
                  padding: '15px',
                  backgroundColor: 'white',
                  border: '1px solid #dee2e6',
                  borderRadius: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                  <h6 style={{ margin: '0', color: '#007bff' }}>
                    {user.first_name} {user.last_name} (@{user.username})
                  </h6>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    backgroundColor: 
                      user.role === 'admin' ? '#dc3545' :
                      user.role === 'manager' ? '#fd7e14' :
                      user.role === 'user' ? '#28a745' : '#6c757d',
                    color: 'white'
                  }}>
                    {user.role}
                  </span>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#6c757d', marginBottom: '10px' }}>
                  <div>Email: {user.email}</div>
                  <div>Department: {user.department}</div>
                  <div>Created: {new Date(user.created_at).toLocaleDateString()}</div>
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button
                    onClick={() => openEditModal('users', user)}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => deleteItem('users', user.id, user.username)}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h4>Edit {editingItem.type.slice(0, -1)}</h4>
            
            {editingItem.type === 'users' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <div>
                  <label>Username:</label>
                  <input
                    type="text"
                    value={editingItem.username || ''}
                    onChange={(e) => setEditingItem({...editingItem, username: e.target.value})}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                </div>
                <div>
                  <label>Email:</label>
                  <input
                    type="email"
                    value={editingItem.email || ''}
                    onChange={(e) => setEditingItem({...editingItem, email: e.target.value})}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                </div>
                <div>
                  <label>First Name:</label>
                  <input
                    type="text"
                    value={editingItem.first_name || ''}
                    onChange={(e) => setEditingItem({...editingItem, first_name: e.target.value})}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                </div>
                <div>
                  <label>Last Name:</label>
                  <input
                    type="text"
                    value={editingItem.last_name || ''}
                    onChange={(e) => setEditingItem({...editingItem, last_name: e.target.value})}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                </div>
                <div>
                  <label>Role:</label>
                  <select
                    value={editingItem.role || 'user'}
                    onChange={(e) => setEditingItem({...editingItem, role: e.target.value})}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  >
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
                <div>
                  <label>Department:</label>
                  <input
                    type="text"
                    value={editingItem.department || ''}
                    onChange={(e) => setEditingItem({...editingItem, department: e.target.value})}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                </div>
                <div>
                  <label>Status:</label>
                  <select
                    value={editingItem.is_active ? 1 : 0}
                    onChange={(e) => setEditingItem({...editingItem, is_active: parseInt(e.target.value)})}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingItem(null);
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => updateItem(editingItem.type, editingItem.id, editingItem)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterDataManager;