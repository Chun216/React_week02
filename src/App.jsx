import { useState } from 'react'
import axios from 'axios'
import viteLogo from '/vite.svg'

// 這裡import不要加''不然會變成字串顯示
const BASE_URL =  import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

function App() {
  // 點選查看細節後才會有狀態改變
  const [tempProduct, setTempProduct] = useState({});
  // axios取得資料後，狀態的改變
  const [products, setProducts] = useState([]);
  // 驗證是否登入，狀態是否發生變化，初始值是false
  const [isAuth, setIsAuth] = useState(false)
  const [account, setAccount] = useState({
    username:'',
    password:''
  });

  const handleInputChange = (e) => {
    const { value, name } = e.target
    setAccount({
      ...account,
      [name]: value
    })
  }

  const handleLogin = (e) => {
    e.preventDefault()
    axios.post(`${BASE_URL}/v2/admin/signin`, account)
      // .then((res) => console.log(res)) 用來驗證
      // 當登入成功，狀態轉為true
      .then((res) => {
        // 把token與到期日從資料中解構出來
        const { token, expired } = res.data;
        // console.log(token, expired) 確認是否成功存取
        // 存取在cookie中
        document.cookie = `chunToken=${token}; expires=${new Date(expired).toUTCString()}`;
        axios.defaults.headers.common['Authorization'] = token;
        setIsAuth(true)
        axios.get(`${BASE_URL}/v2/api/${API_PATH}/admin/products`)
          .then((res) => setProducts(res.data.products))
          .catch((error => console.log(error)))
      })
      .catch((error) => alert('登入失敗'))
  }

  // 採用async/await寫法
  const checkLogin = async() => {
    try {
      const res = await axios.post(`${BASE_URL}/v2/api/user/check`)
      alert('使用者已經登入')
    } catch (error) {
      console.log(error)
    }
  }
  // 本來的寫法
  // const checkLogin = () {
  //   axios.post(`${BASE_URL}/v2/api/user/check`)
  //     .then((res) => alert('使用者已經登入'))
  //     .catch((error) => console.log(error))
  // }

  return (
    <>
      {
        isAuth ? (<div className="container">
          <div className="row">
              <div className="col-6">
                <button type="button" className="btn btn-success mb-2" onClick={checkLogin}>確認是否登入</button>
                <h2>產品列表</h2>
                <table className="table">
                    <thead>
                      <tr>
                        <th scope="col">產品名稱</th>
                        <th scope="col">原價</th>
                        <th scope="col">售價</th>
                        <th scope="col">是否啟用</th>
                        <th scope="col">查看細節</th>
                      </tr>
                    </thead>
                    <tbody>
                        {products.map((item,index)=> {
                            return <tr key={index}>
                              <th scope="row">{item.title}</th>
                              <td>{item.origin_price}</td>
                              <td>{item.price}</td>
                              <td>{item.is_enabled}</td>
                              <td><button onClick={()=> {setTempProduct(item)}} type="button" className="details btn btn-primary">查看細節</button></td>
                            </tr>
                        })}
                    </tbody>
                </table>
              </div>
              <div className="col-6">
                  <h2>單一產品列表</h2>
                  {tempProduct.title ? <div className="card">
                    <img src={tempProduct.imageUrl} className="card-img-top" alt="..." />
                    <div className="card-body">
                      <h5 className="card-title">{tempProduct.title}<span className="badge bg-primary">{tempProduct.category}</span></h5>
                      <p className="card-text">商品描述：{tempProduct.description}</p>
                      <p className="card-text">商品內容：{tempProduct.content}</p>
                      <span className="card-text"><del>{tempProduct.origin_price}元</del> / {tempProduct.price}元</span>
                      <h5 className="card-title mt-2">更多圖片：</h5>
                      <img src={tempProduct.imagesUrl} alt="" className="card-img-top" />
                    </div>
                  </div> : <p>請選擇一個商品查看</p>}
                  
              </div>
          </div>
      </div>) : <div className="d-flex flex-column justify-content-center align-items-center vh-100">
          <h1 className="mb-5">請先登入</h1>
          <form onSubmit={handleLogin} className="d-flex flex-column gap-3">
            <div className="form-floating mb-3">
              <input name="username" value={account.username} onChange={handleInputChange} type="email" className="form-control" id="username" placeholder="name@example.com" />
              <label htmlFor="username">Email address</label>
            </div>
            <div className="form-floating">
              <input name="password" value={account.password} onChange={handleInputChange} type="password" className="form-control" id="password" placeholder="Password" />
              <label htmlFor="password">Password</label>
            </div>
            <button className="btn btn-primary">登入</button>
          </form>
          <p className="mt-5 mb-3 text-muted">&copy; 2024~∞ - 六角學院</p>
        </div>
      }
    </>
  )
}

export default App

