import csv

# 读取采购申请数据
purchase_requests = []
with open('db/data/scp.cloud.PurchaseRequests.csv', 'r', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    for row in reader:
        purchase_requests.append(row)

print(f"读取了 {len(purchase_requests)} 个采购申请记录")
if purchase_requests:
    print(f"第一个记录的字段: {list(purchase_requests[0].keys())}")
    print(f"第一个记录的identifier: {purchase_requests[0].get('identifier', 'NOT FOUND')}")

# 定义阶段映射，每个阶段有开始和结束时间字段
stages = [
    {'text': '采购申请提交', 'start_field': 'requestDate', 'end_field': 'requestDate'},
    {'text': '采购申请审批', 'start_field': 'requestDate', 'end_field': 'modifyDate'},
    {'text': '采购订单创建', 'start_field': 'modifyDate', 'end_field': 'orderDate'},
    {'text': '采购订单审批', 'start_field': 'orderDate', 'end_field': 'approvalDate'},
    {'text': '采购订单收货', 'start_field': 'approvalDate', 'end_field': 'deliveryDate'}
]

# 生成时间线数据
timeline_data = []

for request in purchase_requests:
    purchase_request_id = request['ID']

    for i, stage in enumerate(stages):
        start_date_value = request.get(stage['start_field'], '')
        end_date_value = request.get(stage['end_field'], '')


        # 特殊处理前两个阶段：设置开始时间为18:00
        if i == 0 and end_date_value:  # 前两个阶段（采购申请提交和采购申请审批）
            end_date_value = end_date_value.replace('T00:00:00Z', 'T18:00:00Z') if 'T00:00:00Z' in start_date_value else f"{start_date_value}T18:00:00Z"

        # 特殊处理前两个阶段：设置开始时间为18:00
        if i == 1 and start_date_value:  # 前两个阶段（采购申请提交和采购申请审批）
            start_date_value = start_date_value.replace('T00:00:00Z', 'T18:00:00Z') if 'T00:00:00Z' in start_date_value else f"{start_date_value}T18:00:00Z"
            # 对于第一个阶段，结束时间也设置为18:00
            if i == 0:
                end_date_value = start_date_value

        # 确保日期字段不为空
        if not start_date_value:
            start_date_value = '2025-01-01T00:00:00Z'  # 默认日期
        if not end_date_value:
            end_date_value = '2025-01-02T00:00:00Z'  # 默认日期

        # 转换为ISO格式
        def convert_to_iso(date_str):
            if date_str and 'T' not in date_str:
                return f"{date_str}T00:00:00Z"
            return date_str

        start_date_value = convert_to_iso(start_date_value)
        end_date_value = convert_to_iso(end_date_value)

        timeline_entry = {
            'id': f"{request['identifier']}_{i+1}",
            'text': stage['text'],
            'type': 'task',
            'startTime': start_date_value,
            'endTime': end_date_value,
            'purchaseRequest_ID': purchase_request_id
        }

        timeline_data.append(timeline_entry)

print(f"生成了 {len(timeline_data)} 条时间线记录")

# 写入新的时间线文件
with open('db/data/scp.cloud.PurchaseProcessTimeline.csv', 'w', encoding='utf-8', newline='') as f:
    if timeline_data:
        fieldnames = ['id', 'text', 'type', 'startTime', 'endTime', 'purchaseRequest_ID']
        writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter=';')
        writer.writeheader()
        writer.writerows(timeline_data)

print(f"成功生成 {len(timeline_data)} 条时间线记录，覆盖了 {len(purchase_requests)} 个订单的 {len(stages)} 个阶段")