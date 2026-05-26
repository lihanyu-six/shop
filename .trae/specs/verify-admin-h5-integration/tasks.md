# 任务列表

- [x] Task 1: 启动系统并验证基础运行状态 ✅ PASS
  - 启动 backend（端口 3000）、admin（端口 5173）、frontend（端口 5174）
  - 确认三个服务均正常启动，无编译错误

- [x] Task 2: 验证「人员管理 → H5登录」闭环 ✅ PASS
  - 通过后台接口查询已有人员数据（手机号）
  - 在H5端使用该手机号发起登录请求
  - 确认登录成功返回token

- [x] Task 3: 验证「菜品管理 → H5菜品展示」闭环 ✅ PASS
  - 通过后台接口查询已有菜品和每日菜单数据
  - 在H5端请求菜品列表（GET /api/dishes）
  - 在H5端请求今日菜单（GET /api/dishes/daily?date=&mealType=）
  - 确认H5返回的菜品数据与后台数据库一致

- [x] Task 4: 验证「预约时间设置 → H5订餐约束」闭环 ✅ PASS
  - 通过后台接口查询 reservation_settings 数据
  - 在H5端请求预约设置接口
  - 确认前后端预约时间数据一致

- [x] Task 5: 验证「通知公告 → H5展示」闭环 ✅ PASS
  - 通过后台接口查询已发布（status=1）的公告
  - 在H5端请求公告列表（GET /api/notices）
  - 在H5端查看某条公告详情（GET /api/notices/:id）
  - 确认H5返回的公告数据与后台数据库一致

- [x] Task 6: 验证「调查问卷 → H5填写」闭环 ✅ PASS
  - 通过后台接口查询已发布（status=1）的问卷
  - 在H5端请求问卷列表（GET /api/surveys）
  - 在H5端（已登录）提交问卷（POST /api/surveys/:id/responses）
  - 通过后台接口确认答卷已入库

- [x] Task 7: 验证「意见反馈 → 后台查看与回复」闭环 ✅ PASS
  - H5端提交意见反馈（POST /api/feedback），记录反馈ID
  - 后台接口查询反馈列表（GET /api/feedback/admin/list），确认新提交的反馈可见
  - 后台接口对反馈进行回复（POST /api/feedback/admin/:id/reply）
  - H5端查询反馈详情（GET /api/feedback/:id），确认回复内容可见

- [x] Task 8: 汇总验证结果并报告 ✅ 全部6条链路验证通过
  - 汇总7项验证的通过/失败情况
  - 对失败项分析原因并记录

# Task Dependencies
- Task 2-7 均依赖 Task 1（系统必须启动）
- Task 2-7 可并行执行
- Task 8 依赖 Task 2-7