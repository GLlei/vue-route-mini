import Vue from 'vue'
import VueRouter from './vue-route-mini'
Vue.use(VueRouter)

import Home from './Home'
import About from './About'
import Delay from './Delay'


export default new VueRouter({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home      
    },
    {
      path: '/about',
      name: 'about',
      component: About
    },
    {
      path: '/delay',
      name: 'delay',
      component: Delay,
      beforeEnter(from,to,next){
        console.log(`beforEnterHome from ${from} to ${to}`)
        setTimeout(()=>{
          next()
        },1000)        
      }
    }
  ]
})