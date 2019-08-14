# vue-route-mini

> A Vue.js project

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build
```

For detailed explanation on how things work, consult the [docs for vue-loader](http://vuejs.github.io/vue-loader).

* 本文全部源码（可运行，有帮助请给start）
[https://github.com/GLlei/vue-route-mini](https://github.com/GLlei/vue-route-mini)

* 参考链接
[http://shengxinjing.cn/vue/router.html](http://shengxinjing.cn/vue/router.html)

* vue-route源码
[https://github.com/vuejs/vue-router](https://github.com/vuejs/vue-router)

* 官方文档
[https://router.vuejs.org](https://router.vuejs.org/)

#vue-router实战
---
先列一段最简单的router代码

1.Vue.use安装路由插件
2.对外暴露了一个new Router的对象，里面包含所有路由的配置
```
import VueRouter from 'vue-router'
Vue.use(VueRouter)

export default new VueRouter({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      beforeEnter(from,to,next){
          console.log(`beforEnterHome from ${from} to ${to}`)
          setTimeout(()=>{
            next()
          },1000)
          // next()
      }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
    }
  ]
})
```
初始化的时候，直接把这个返回的对象传递到new Vue中
```
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

```
模板层自带了router-link和router-view两个组件

```
<div id="nav">
      <button @click="about">about</button>
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div>
    <router-view/>
```
#实现自己的vue-router
---
我们新建vue-router文件夹 新建index.js, 大家都已经是黄金水平了，就不介绍太多基础知识了，基本上迷你的router，这几块就可以构成
```
export default class Router{
    constructor(){

    }
    init(){
        // 初始化
    }
    bindEvents(){
        // 绑定事件
    }
    createRouteMap(){
        // 初始化路由表
    }
    initComponent(){
        // 注册router-link和router-view路由
    }
}

```
#插件机制
---
我们使用Vue.use(VueRouter)来注册和启动路由, 这个咱们整vuex源码的时候整过了，带上一个install方法就可以，先注册一个简单的调试信息看下
```
let Vue
class Router {
    static install(_Vue) {
        Vue = _Vue
        Vue.mixin({
            beforeCreate() {
                if(this.$options.router){
                    // new Vue的时候传递的
                    Vue.prototype.$routerMsg = '路由安装完毕'
                }
            }
        })
    }
}
```
app.vue使用$routerMsg可以直接显示出信息，bingo
#单页应用原理
---
1.hash模式，改变锚点
2.history模式，利用了html的popState和pushState方法 ，url发生变化，不会刷新页面 两者做路由跳转和监听的事件削微的有些不一样，这里我们只演示一下hash，实际情况hash和history用两个class就成
我们在install的时候，执行init 启动整个路由, 监听onload和hashchange事件，触发后，根据当前的hash，找到需要渲染的组件，然后去渲染router-view的内容就欧克了
>hash变化后，通知到router-view渲染，需要借用Vue本身的响应式能力
```
static install(_Vue) {
        Vue = _Vue
        Vue.mixin({
            beforeCreate() {
                if(this.$options.router){
                    // new Vue的时候传递的
                    Vue.prototype.$routerMsg = '路由安装完毕'
                    Vue.prototype.$router = this.$options.router
                    this.$options.router.init()
                }
            }
        })
    }
    init() {
        this.bindEvents()
        this.createRouteMap(this.$options)
        this.initComponent(Vue)
    }
    bindEvents(){
        window.addEventListener('load', this.onHashChange.bind(this), false)
        window.addEventListener('hashchange', this.onHashChange.bind(this), false)
    }
```
# 路由映射表
---
上面说的有一步，就是根据当前hash路由，找到需要渲染的组件，咱们传递进来的事数组，查找起来费劲，转成对象，方便查找和定位组件，我们称之为路由映射表
```
constructor(options) {
        this.$options = options
        this.routeMap = {}
    }
    createRouteMap(options) {
        options.routes.forEach(item => {
            this.routeMap[item.path] = item
        })
    }

```
#注册组件router-view
---
在组件的render函数里，根据this.app.current里面存储的路由，查找到组件 然后渲染即可
>这里的h，就是React里面的createElement一个概念，以后给大家写虚拟dom源码的时候，大家会有更深刻的理解
```
Vue.component('router-view', {
    render:h=>{
        var component = this.routeMap[this.app.current].component
        return h(component)
    }
})
```
#注册组件router-link
---
router-link整成a标签就可以，记得带上插槽
>这里面的写法 就是传说中的JSX
```
Vue.component('router-link', {
    props: {
        to: String
    },
    render(h){
        return <a href={this.to}>{this.$slots.default}</a>
    }
})

```
#onHashchange
---
具体处理hash变化的逻辑，其实很easy，因为我们利用Vue的响应式原理来存储当前路由，我们获取当前的hash，然后直接利用Vue响应式机制通知router-view即可

```
constructor(options) {
        this.$options = options
        this.routeMap = {}
        this.app = new Vue({
            data: {
                current: '/'
            }
        })

    }
    onHashChange(e) {
        let hash = this.getHash()
        let router = this.routeMap[hash]
        this.app.current = this.getHash()
    }
```
#路由守卫
注册路由的时候，可以带上生命周期 并且生命周期的参数next，执行后才跳转，可以做路由守卫的工作，比如咱们小小的模拟一下，2秒后再跳转
```
{
      path: '/',
      name: 'home',
      component: Home,
      beforeEnter(from,to,next){
          console.log(`beforEnterHome from ${from} to ${to}`)
          setTimeout(()=>{
            next()
          },1000)
          // next()
      }
    },
```
实际的Router中，路由守卫的逻辑很复杂，是一个异步队列的依次执行，有点像koa或者redux的中间件执行逻辑，咱们只考虑一个 简化一下逻辑
```
    if(router.beforeEnter){
        router.beforeEnter(from, to, ()=>{
            this.app.current = this.getHash()

        })
    }else{
        this.app.current = this.getHash()
    }
```
#扩展
---
实际的vue-router代码，要复杂很多，很多容错的处理，有几个扩展点大家可以重点关注

1.  路由嵌套
    1.  递归注册+ 层级查找渲染router-view
2.  路由变量 （使用path-to-regexp）
3.  路由守卫队列
    1.  异步队列
4.  addRouter动态添加路由