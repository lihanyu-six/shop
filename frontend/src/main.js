import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { Button, Form, Field, CellGroup, Tabbar, TabbarItem, NavBar, Card, Stepper, Tag, Popup, Dialog, Toast, Loading, PullRefresh, List, Empty, Tabs, Tab, RadioGroup, Radio, Checkbox, CheckboxGroup, Image as VanImage, Badge, Icon, ActionSheet, Picker, Cell } from 'vant'
import 'vant/lib/index.css'
import './style/global.less'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.use(Button)
app.use(Form)
app.use(Field)
app.use(CellGroup)
app.use(Tabbar)
app.use(TabbarItem)
app.use(NavBar)
app.use(Card)
app.use(Stepper)
app.use(Tag)
app.use(Popup)
app.use(Dialog)
app.use(Toast)
app.use(Loading)
app.use(PullRefresh)
app.use(List)
app.use(Empty)
app.use(Tabs)
app.use(Tab)
app.use(RadioGroup)
app.use(Radio)
app.use(Checkbox)
app.use(CheckboxGroup)
app.use(VanImage)
app.use(Badge)
app.use(Icon)
app.use(ActionSheet)
app.use(Picker)
app.use(Cell)

app.mount('#app')
