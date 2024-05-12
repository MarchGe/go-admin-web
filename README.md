# go-admin-web

#### 介绍
go-admin-web 是 go-admin-server 项目的前端部分，采用 Vue3 + ElementPlus + Vite 技术栈，实现基于RBAC的权限管理，提供服务器性能监控、Web Shell、一键部署等功能。后端项目 go-admin-server。

#### 项目源码
- GitHub: https://github.com/MarchGe/go-admin-web
- Gitee: https://gitee.com/go-admin_1/go-admin-web

#### 在线体验
- https://go-admin.dy-technology.com

#### 安装教程
1. 修改src/config-dev.js
   ```javascript
    ws: { // websocket服务的访问地址，一般就是admin-web的访问地址，指示需要以ws或wss开头
        host: "wss://your-domain:your-port"
    }
   ```
2. npm run build
3. 构建好的静态文件（例如dist文件夹）拷贝到服务器上。
4. 修改nginx配置
```
upstream go-admin-server {
    least_conn;
    server 【go-admin-server_host】:14040 weight=1 ;
}
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}
server {
    server_name 【your_own_domain】;
    listen 443 ssl http2;
    ssl_certificate 【public_key】;
    ssl_certificate_key 【private_key】;
    ssl_protocols TLSv1.2 TLSv1.3;
    location / {
        root /【your_custom_path】/dist;
        try_files $uri $uri/ /index.html;
    }
    location /bg-admin {
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Host $http_host;
        proxy_set_header X-Forwarded-Port $server_port;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_pass http://go-admin-server;
        rewrite ^\/bg-(.*)$ /$1 break;    # 根据需要决定是否重写url，这个示例把前端/bg-admin/xxx代理到后端/admin/xxx接口
    }
    location /bg-admin/terminal/ws {
        proxy_read_timeout 8h;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Sec-WebSocket-Key $http_sec_websocket_key;
        proxy_set_header Sec-WebSocket-Extensions $http_sec_websocket_extensions;
        proxy_set_header Sec-WebSocket-Accept $http_sec_websocket_accept;
        proxy_set_header Sec-WebSocket-Protocol $http_sec_websocket_protocol;
        proxy_set_header Sec-WebSocket-Version $http_sec_websocket_version;
        proxy_pass http://go-admin-server;
        rewrite ^\/bg-(.*)$ /$1 break;
    }
    location /bg-admin/sse {
        proxy_buffering off;
        keepalive_timeout 60s;
        proxy_pass http://go-admin-server;
        rewrite ^\/bg-(.*)$ /$1 break;
    }
    location /bg-admin/devops/app/upload {
        client_max_body_size 500m;
        client_body_buffer_size 2m;
        proxy_pass http://go-admin-server;
        rewrite ^\/bg-(.*)$ /$1 break;
    }
}
```
5. 启动nginx服务即可。