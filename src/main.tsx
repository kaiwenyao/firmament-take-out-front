import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom' // 1. 引入 Provider
import router from './router' // 2. 引入你刚才写的 router 配置
import './index.css'
    // {/* 3. 使用 RouterProvider，并传入 router */}
    // {/* 注意：不要在这里写 <App />，因为 router 配置里已经包含了 App */}
ReactDOM.createRoot(document.getElementById('root')!).render(

    <RouterProvider router={router} />
)