import {createServer} from 'node:http';
import {readdirSync,readFileSync} from 'node:fs';
import {extname,join,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('./dist/',import.meta.url));
const files=new Map();
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon','.wasm':'application/wasm'};
// 只提供随包构建的静态文件，页面计算在浏览器中完成。
function collect(directory,sourceRoot=root){
  for(const item of readdirSync(directory,{withFileTypes:true})){
    const file=join(directory,item.name);
    if(item.isDirectory())collect(file,sourceRoot);
    else if(item.isFile())files.set('/'+relative(sourceRoot,file).replaceAll('\\','/'),{body:readFileSync(file),type:types[extname(file)]??'application/octet-stream'});
  }
}
try{collect(root);const publicRoot=fileURLToPath(new URL('./public/',import.meta.url));collect(publicRoot,publicRoot);}catch{console.error('实验文件不完整，请让编码助手按 README 重新构建。');process.exit(1);}
const server=createServer((request,response)=>{
  const pathname=new URL(request.url,'http://127.0.0.1').pathname;
  const file=files.get(pathname==='/'?'/index.html':pathname);
  if(!file){response.writeHead(404);response.end('没有找到这个实验页面。');return;}
  response.writeHead(200,{'content-type':file.type});
  response.end(request.method==='HEAD'?undefined:file.body);
});
server.listen(4319,'127.0.0.1',()=>console.log('模型机制观察室：http://127.0.0.1:4319'));
server.on('error',error=>{console.error(error.code==='EADDRINUSE'?'端口4319已被占用，请关闭另一个模型机制观察室窗口。':'实验服务启动失败。');process.exit(1);});
