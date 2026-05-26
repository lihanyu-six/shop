<template>
  <div class="notifications-container">
    <van-nav-bar
      title="消息通知"
      left-arrow
      @click-left="$router.back()"
      :border="false"
    >
      <template #right>
        <van-icon name="ellipsis" size="20" />
        <van-icon name="eye-o" size="20" style="margin-left: 15px" />
      </template>
    </van-nav-bar>

    <div class="notification-list">
      <div
        v-for="(item, index) in notifications"
        :key="index"
        class="notification-item"
        @click="viewDetail(item)"
      >
        <div class="icon-wrapper">
          <van-icon name="info-o" size="22" color="#1989fa" />
        </div>
        <div class="content-wrapper">
          <h4>{{ item.title }}</h4>
          <p class="message">{{ item.message }}</p>
          <p class="time">{{ item.time }}</p>
        </div>
      </div>

      <van-empty
        v-if="notifications.length === 0"
        description="暂无消息"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()

const notifications = ref([
  {
    id: 1,
    title: '系统公告消息',
    message: '您于2026年1月22日预约的早餐由于库存不足原因导致无法正常发放，请重新预约！',
    time: '1月22日 08:40'
  },
  {
    id: 2,
    title: '系统公告消息',
    message: '测试问卷xx，点击即可跳转',
    time: '1月22日 08:40'
  },
  {
    id: 3,
    title: '系统公告消息',
    message: '食堂将于本周末进行系统升级维护，届时订餐功能将暂停使用，请提前安排用餐计划。',
    time: '1月20日 10:15'
  },
  {
    id: 4,
    title: '系统公告消息',
    message: '新增多款特色菜品，欢迎品尝！包括：红烧肉、宫保鸡丁、麻婆豆腐等。',
    time: '1月18日 09:30'
  },
  {
    id: 5,
    title: '系统公告消息',
    message: '为提升服务质量，我们推出了满意度调查问卷，您的意见对我们非常重要！',
    time: '1月15日 14:20'
  },
  {
    id: 6,
    title: '系统公告消息',
    message: '春节期间营业时间调整：除夕至初二休息，初三恢复正常营业。祝您新春快乐！',
    time: '1月12日 11:00'
  },
  {
    id: 7,
    title: '系统公告消息',
    message: '本周五将举办美食节活动，现场有优惠折扣和精美礼品，欢迎参与！',
    time: '1月10日 16:45'
  },
  {
    id: 8,
    title: '系统公告消息',
    message: '感谢您对食堂工作的支持与理解！如有任何建议或投诉，请通过反馈渠道联系我们。',
    time: '1月8日 08:55'
  }
])

function viewDetail(item) {
  showToast('查看详情：' + item.title)
}
</script>

<style scoped lang="less">
.notifications-container {
  min-height: 100vh;
  background: #f5f6f7;
}

.notification-list {
  padding: 12px 16px;
}

.notification-item {
  background: #fff;
  border-radius: 12px;
  padding: 18px 16px;
  margin-bottom: 12px;
  display: flex;
  gap: 14px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  &:active {
    transform: scale(0.98);
    background: #fafafa;
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.icon-wrapper {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #e8f4ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.content-wrapper {
  flex: 1;
  min-width: 0;

  h4 {
    font-size: 15px;
    font-weight: 600;
    color: #333;
    margin: 0 0 8px 0;
  }

  .message {
    font-size: 14px;
    color: #666;
    line-height: 1.5;
    margin: 0 0 10px 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .time {
    font-size: 13px;
    color: #999;
    margin: 0;
  }
}
</style>
