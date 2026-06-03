import { useState, useEffect } from 'react'

const API = 'http://localhost:3000/api'

const s = {
  page: { maxWidth: '960px', margin: '0 auto', padding: '24px 16px' },
  nav: { background: '#fff', borderBottom: '1px solid #e0e0e0', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' },
  navBtns: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  btn: { padding: '8px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' },
  btnRed: { padding: '8px 18px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' },
  btnGray: { padding: '8px 18px', background: '#6b7280', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' },
  btnActive: { padding: '8px 18px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', textDecoration: 'underline' },
  card: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '18px 20px', marginBottom: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  input: { padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', width: '100%', marginBottom: '10px', fontSize: '14px', color: '#222', background: '#fff' },
  formBox: { background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px', marginBottom: '20px' },
  h2: { fontSize: '22px', fontWeight: 700, marginBottom: '16px', color: '#111' },
  tag: { display: 'inline-block', background: '#eff6ff', color: '#2563eb', borderRadius: '4px', padding: '2px 8px', fontSize: '12px', fontWeight: 600, marginRight: '6px' },
  price: { fontWeight: 700, fontSize: '18px', color: '#16a34a', marginTop: '6px' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' },
}

export default function App() {
  const [page, setPage] = useState('products')
  const [user, setUser] = useState(null)
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [orders, setOrders] = useState([])
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ username: '', password: '' })
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: '', description: '' })
  const [authError, setAuthError] = useState('')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Всі')
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    fetch(`${API}/products`).then(r => r.json()).then(setProducts)
    fetch(`${API}/orders`).then(r => r.json()).then(setOrders)
  }, [])

  const login = async () => {
    const res = await fetch(`${API}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(loginForm) })
    const data = await res.json()
    if (data.success) { setUser(data.user); setAuthError(''); setPage('products') }
    else setAuthError(data.message)
  }

  const register = async () => {
    const res = await fetch(`${API}/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(registerForm) })
    const data = await res.json()
    if (data.success) { setUser(data.user); setAuthError(''); setPage('products') }
    else setAuthError(data.message)
  }

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price) return
    const res = await fetch(`${API}/products`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newProduct, price: Number(newProduct.price) }) })
    const data = await res.json()
    setProducts([...products, data])
    setNewProduct({ name: '', price: '', category: '', description: '' })
    setShowAddForm(false)
  }

  const addToCart = (product) => {
    const existing = cart.find(i => i.id === product.id)
    if (existing) setCart(cart.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i))
    else setCart([...cart, { ...product, qty: 1 }])
  }

  const removeFromCart = (id) => setCart(cart.filter(i => i.id !== id))

  const placeOrder = async () => {
    if (cart.length === 0) return
    const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0)
    const res = await fetch(`${API}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: cart, total, user: user?.username || 'Гість' }) })
    const data = await res.json()
    setOrders([...orders, data])
    setCart([])
    setPage('orders')
  }

  const getRecommended = () => {
    const boughtIds = new Set(orders.flatMap(o => o.items.map(i => i.id)))
    const notBought = products.filter(p => !boughtIds.has(p.id))
    if (notBought.length > 0) return notBought.slice(0, 4)
    return products.slice(0, 4)
  }

  const categories = ['Всі', ...new Set(products.map(p => p.category))]
  const filtered = products
    .filter(p => categoryFilter === 'Всі' || p.category === categoryFilter)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  const NavBtn = ({ name, label }) => (
    <button style={page === name ? s.btnActive : s.btn} onClick={() => setPage(name)}>{label}</button>
  )

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh' }}>
      <div style={s.nav}>
        <div style={s.navBtns}>
          <NavBtn name="products" label="Товари" />
          <NavBtn name="cart" label={`Кошик (${cart.length})`} />
          <NavBtn name="orders" label="Замовлення" />
          <NavBtn name="recommended" label="Рекомендації" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user ? (
            <>
              <span style={{ fontWeight: 600, color: '#2563eb' }}>👤 {user.username}</span>
              <button style={s.btnGray} onClick={() => setUser(null)}>Вийти</button>
            </>
          ) : (
            <>
              <button style={s.btn} onClick={() => setPage('login')}>Увійти</button>
              <button style={s.btnGray} onClick={() => setPage('register')}>Реєстрація</button>
            </>
          )}
        </div>
      </div>

      <div style={s.page}>

        {page === 'products' && (
          <div>
            <div style={s.row}>
              <h2 style={s.h2}>Каталог товарів</h2>
              {user && <button style={s.btn} onClick={() => setShowAddForm(!showAddForm)}>+ Додати товар</button>}
            </div>

            {user && showAddForm && (
              <div style={{ ...s.formBox, marginTop: '16px' }}>
                <h3 style={{ marginBottom: '12px', color: '#111' }}>Новий товар</h3>
                <input style={s.input} placeholder="Назва" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
                <input style={s.input} placeholder="Ціна (грн)" type="number" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
                <input style={s.input} placeholder="Категорія" value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} />
                <input style={s.input} placeholder="Опис" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} />
                <button style={s.btn} onClick={addProduct}>Зберегти</button>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', margin: '16px 0', flexWrap: 'wrap' }}>
              <input style={{ ...s.input, marginBottom: 0, flex: 1, minWidth: '200px' }} placeholder="Пошук за назвою..." value={search} onChange={e => setSearch(e.target.value)} />
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', background: '#fff' }}>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            {filtered.length === 0 && <p style={{ color: '#888' }}>Товарів не знайдено</p>}
            {filtered.map(p => (
              <div key={p.id} style={s.card}>
                <div style={s.row}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '17px' }}>{p.name}</div>
                    <div style={{ marginTop: '4px' }}>
                      <span style={s.tag}>{p.category}</span>
                      <span style={{ color: '#6b7280', fontSize: '14px' }}>{p.description}</span>
                    </div>
                    <div style={s.price}>{p.price.toLocaleString()} грн</div>
                  </div>
                  <button style={s.btn} onClick={() => addToCart(p)}>+ В кошик</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {page === 'cart' && (
          <div>
            <h2 style={s.h2}>Кошик</h2>
            {cart.length === 0 && <p style={{ color: '#888' }}>Кошик порожній</p>}
            {cart.map(i => (
              <div key={i.id} style={s.card}>
                <div style={s.row}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{i.name}</div>
                    <div style={{ color: '#6b7280', fontSize: '14px' }}>{i.qty} шт × {i.price.toLocaleString()} грн</div>
                    <div style={s.price}>{(i.price * i.qty).toLocaleString()} грн</div>
                  </div>
                  <button style={s.btnRed} onClick={() => removeFromCart(i.id)}>Видалити</button>
                </div>
              </div>
            ))}
            {cart.length > 0 && (
              <div style={{ ...s.card, background: '#f0fdf4' }}>
                <div style={s.row}>
                  <span style={{ fontWeight: 700, fontSize: '18px' }}>Разом: {cart.reduce((sum, i) => sum + i.price * i.qty, 0).toLocaleString()} грн</span>
                  <button style={{ ...s.btn, background: '#16a34a' }} onClick={placeOrder}>Оформити замовлення</button>
                </div>
              </div>
            )}
          </div>
        )}

        {page === 'orders' && (
          <div>
            <h2 style={s.h2}>Замовлення</h2>
            {orders.length === 0 && <p style={{ color: '#888' }}>Замовлень ще немає</p>}
            {[...orders].reverse().map(o => (
              <div key={o.id} style={s.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>📅 {o.date}</span>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>👤 {o.user}</span>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  {o.items.map(i => (
                    <span key={i.id} style={{ ...s.tag, marginBottom: '4px' }}>{i.name} ×{i.qty}</span>
                  ))}
                </div>
                <div style={s.price}>Сума: {o.total.toLocaleString()} грн</div>
              </div>
            ))}
          </div>
        )}

        {page === 'recommended' && (
          <div>
            <h2 style={s.h2}>Рекомендації для вас</h2>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>Товари, які ви ще не купували</p>
            {getRecommended().length === 0 && <p style={{ color: '#888' }}>Ви вже купили всі товари!</p>}
            {getRecommended().map(p => (
              <div key={p.id} style={s.card}>
                <div style={s.row}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '17px' }}>{p.name}</div>
                    <span style={s.tag}>{p.category}</span>
                    <div style={s.price}>{p.price.toLocaleString()} грн</div>
                  </div>
                  <button style={s.btn} onClick={() => addToCart(p)}>+ В кошик</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {page === 'login' && (
          <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            <h2 style={s.h2}>Вхід</h2>
            {authError && <p style={{ color: '#dc2626', marginBottom: '10px' }}>{authError}</p>}
            <div style={s.formBox}>
              <input style={s.input} placeholder="Логін" value={loginForm.username} onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} />
              <input style={s.input} placeholder="Пароль" type="password" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />
              <button style={{ ...s.btn, width: '100%' }} onClick={login}>Увійти</button>
            </div>
          </div>
        )}

        {page === 'register' && (
          <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            <h2 style={s.h2}>Реєстрація</h2>
            {authError && <p style={{ color: '#dc2626', marginBottom: '10px' }}>{authError}</p>}
            <div style={s.formBox}>
              <input style={s.input} placeholder="Логін" value={registerForm.username} onChange={e => setRegisterForm({ ...registerForm, username: e.target.value })} />
              <input style={s.input} placeholder="Пароль" type="password" value={registerForm.password} onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })} />
              <button style={{ ...s.btn, width: '100%' }} onClick={register}>Зареєструватись</button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}