<template>
  <div class="consumption-container">
    <van-nav-bar
      title="消费记录"
      left-arrow
      @click-left="$router.back()"
      :border="false"
    >
      <template #right>
        <van-icon name="ellipsis" size="20" />
        <van-icon name="eye-o" size="20" style="margin-left: 15px" />
      </template>
    </van-nav-bar>

    <div class="update-time">
      <van-icon name="clock-o" size="14" />
      <span>数据已更新 {{ updateTime }}</span>
    </div>

    <div class="summary-card">
      <div class="summary-left">
        <p class="label">本月累计支出</p>
        <h2 class="amount">¥ {{ totalAmount.toFixed(2) }}</h2>
      </div>
      <div class="summary-right">
        <button class="month-btn" @click="showMonthPicker = true">
          <van-icon name="calendar-o" size="16" />
          {{ currentMonth }}
        </button>
        <p class="count">共{{ records.length }}条消费明细</p>
      </div>
    </div>

    <div class="records-section">
      <div class="section-header">
        <h3>消费明细</h3>
        <span>共{{ records.length }}条消费明细</span>
      </div>

      <div class="record-list">
        <div
          v-for="(record, index) in records"
          :key="index"
          class="record-item"
        >
          <div class="record-main">
            <p class="machine">消费机器号：{{ record.machineId }}</p>
            <p class="time">{{ record.time }}</p>
          </div>
          <div class="record-right">
            <p class="cost">-{{ record.cost.toFixed(2) }}</p>
            <p class="balance">余额：{{ record.balance.toFixed(2) }}</p>
          </div>
        </div>
      </div>
    </div>

    <van-popup v-model:show="showMonthPicker" position="bottom" round>
      <van-picker
        :columns="months"
        @confirm="onMonthConfirm"
        @cancel="showMonthPicker = false"
        title="选择月份"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const updateTime = ref('2026-01-26 07:44:22')
const currentMonth = ref('2026年01月')
const showMonthPicker = ref(false)

const months = [
  '2026年01月',
  '2025年12月',
  '2025年11月',
  '2025年10月',
  '2025年09月'
]

const records = ref([
  {
    machineId: 3,
    time: '2026-01-26 07:44:22',
    cost: 15.00,
    balance: 853.00
  },
  {
    machineId: 3,
    time: '2026-01-25 12:30:15',
    cost: 18.50,
    balance: 868.00
  },
  {
    machineId: 2,
    time: '2026-01-24 18:20:33',
    cost: 22.00,
    balance: 886.50
  },
  {
    machineId: 1,
    time: '2026-01-23 08:15:42',
    cost: 12.00,
    balance: 908.50
  },
  {
    machineId: 3,
    time: '2026-01-22 12:45:18',
    cost: 16.50,
    balance: 920.50
  },
  {
    machineId: 2,
    time: '2026-01-21 19:05:27',
    cost: 20.00,
    balance: 937.00
  },
  {
    machineId: 1,
    time: '2026-01-20 07:50:33',
    cost: 13.50,
    balance: 957.00
  },
  {
    machineId: 3,
    time: '2026-01-19 12:28:41',
    cost: 17.00,
    balance: 970.50
  },
  {
    machineId: 2,
    time: '2026-01-18 18:35:56',
    cost: 19.50,
    balance: 987.50
  },
  {
    machineId: 1,
    time: '2026-01-17 08:22:14',
    cost: 14.00,
    balance: 1007.00
  },
  {
    machineId: 3,
    time: '2026-01-16 12:40:29',
    cost: 15.50,
    balance: 1021.00
  },
  {
    machineId: 2,
    time: '2026-01-15 19:10:38',
    cost: 21.00,
    balance: 1036.50
  },
  {
    machineId: 1,
    time: '2026-01-14 07:55:47',
    cost: 12.50,
    balance: 1057.50
  },
  {
    machineId: 3,
    time: '2026-01-13 12:32:52',
    cost: 16.00,
    balance: 1070.00
  },
  {
    machineId: 2,
    time: '2026-01-12 18:48:15',
    cost: 23.50,
    balance: 1086.00
  },
  {
    machineId: 1,
    time: '2026-01-11 08:18:23',
    cost: 13.00,
    balance: 1109.50
  },
  {
    machineId: 3,
    time: '2026-01-10 12:55:36',
    cost: 18.00,
    balance: 1122.50
  },
  {
    machineId: 2,
    time: '2026-01-09 19:25:44',
    cost: 20.50,
    balance: 1140.50
  },
  {
    machineId: 1,
    time: '2026-01-08 07:42:51',
    cost: 14.50,
    balance: 1161.00
  },
  {
    machineId: 3,
    time: '2026-01-07 12:38:19',
    cost: 17.50,
    balance: 1175.50
  },
  {
    machineId: 2,
    time: '2026-01-06 18:52:27',
    cost: 19.00,
    balance: 1193.00
  },
  {
    machineId: 1,
    time: '2026-01-05 08:08:34',
    cost: 15.00,
    balance: 1212.00
  },
  {
    machineId: 3,
    time: '2026-01-04 12:48:42',
    cost: 16.50,
    balance: 1227.00
  },
  {
    machineId: 2,
    time: '2026-01-03 19:15:58',
    cost: 22.50,
    balance: 1243.50
  }
])

const totalAmount = computed(() => {
  return records.value.reduce((sum, r) => sum + r.cost, 0)
})

function onMonthConfirm({ selectedOptions }) {
  currentMonth.value = selectedOptions[0]?.text || currentMonth.value
  showMonthPicker.value = false
}
</script>

<style scoped lang="less">
.consumption-container {
  min-height: 100vh;
  background: #f5f6f7;
}

.update-time {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 12px;
  color: #1989fa;
  font-size: 13px;

  .van-icon {
    margin-top: 1px;
  }
}

.summary-card {
  background: #fff;
  margin: 0 16px 16px;
  border-radius: 12px;
  padding: 24px 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.summary-left {
  .label {
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
  }

  .amount {
    font-size: 36px;
    color: #1989fa;
    font-weight: 700;
    margin: 0;
  }
}

.summary-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.month-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #1989fa;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;

  &:active {
    background: #1677d9;
  }
}

.count {
  font-size: 13px;
  color: #999;
  margin: 0;
}

.records-section {
  background: #fff;
  margin: 0 16px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f5f6f7;

  h3 {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin: 0;
  }

  span {
    font-size: 13px;
    color: #999;
  }
}

.record-list {
  max-height: calc(100vh - 320px);
  overflow-y: auto;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f5f6f7;

  &:last-child {
    border-bottom: none;
  }
}

.record-main {
  flex: 1;

  .machine {
    font-size: 15px;
    color: #333;
    font-weight: 500;
    margin-bottom: 6px;
  }

  .time {
    font-size: 13px;
    color: #999;
  }
}

.record-right {
  text-align: right;

  .cost {
    font-size: 18px;
    color: #ee0a24;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .balance {
    font-size: 13px;
    color: #666;
  }
}
</style>
