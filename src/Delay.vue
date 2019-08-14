<template>
  <div id="app">
    <h2>Delay</h2>
    <div>{{msg}}</div>
    <br><br>
    <div>这个页面将会延时加载，因为拦截了beforeEnter方法</div>
    <div>This page will be delay to load, because the intercept beforeEnter method</div>    
  </div>
</template>

<script>
export default {
  name: 'Delay',
  data () {
    return {
      msg: 'Welcome to Delay !'
    }
  }
}
</script>

