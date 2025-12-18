# 🚀 快速部署到SAP Build Work Zone

## ✅ 前置条件

1. **SAP BTP账号** - 具有Cloud Foundry访问权限
2. **Work Zone订阅** - 在BTP Cockpit中已订阅SAP Build Work Zone
3. **必需工具安装**:

```powershell
# 安装Cloud Foundry CLI
# 下载地址: https://github.com/cloudfoundry/cli/releases
# 或使用Chocolatey
choco install cloudfoundry-cli

# 安装MBT工具
npm install -g mbt

# 验证安装
cf --version
mbt --version
```

## 📝 部署步骤

### 1. 登录到Cloud Foundry

```powershell
# 登录（替换为您的API endpoint）
cf login -a https://api.cf.eu10.hana.ondemand.com

# 或者对于其他区域：
# cf login -a https://api.cf.us10.hana.ondemand.com
# cf login -a https://api.cf.ap10.hana.ondemand.com

# 输入您的邮箱和密码
# 选择组织(Organization)
# 选择空间(Space)
```

### 2. 运行部署脚本

```powershell
# 在项目根目录运行
.\deploy.ps1
```

或者手动执行：

```powershell
# 2.1 安装依赖
npm install

# 2.2 构建CAP服务
npx cds build --production

# 2.3 构建MTA
mbt build

# 2.4 部署
cf deploy mta_archives/*.mtar
```

### 3. 在Work Zone中配置应用

#### 3.1 访问Work Zone管理界面

1. 登录 [SAP BTP Cockpit](https://cockpit.btp.cloud.sap)
2. 进入您的 Subaccount
3. 点击 **Instances and Subscriptions**
4. 找到 **SAP Build Work Zone, standard edition**
5. 点击 **Go to Application**

#### 3.2 刷新Content Provider

1. 在Work Zone管理界面，点击左侧 **Channel Manager**
2. 点击 **Update Content** 按钮刷新
3. 等待内容更新完成

#### 3.3 添加应用到Content Explorer

1. 点击左侧 **Content Manager**
2. 点击 **Content Explorer**
3. 选择您的HTML5 Apps Provider
4. 找到 **Purchase Request** 应用
5. 点击 **Add to My Content**

#### 3.4 创建或更新Site

**创建新Site:**
1. 点击 **Site Directory**
2. 点击 **Create Site**
3. 输入站点名称（如：My Work Zone）
4. 点击 **Create**

**添加应用到Site:**
1. 进入您的Site编辑器
2. 点击左侧 **Applications**
3. 将 Purchase Request 应用拖入页面
4. 配置应用图标和标题
5. 点击 **Publish**

#### 3.5 配置角色和权限

1. 返回BTP Cockpit
2. 进入 **Security** > **Role Collections**
3. 找到或创建以下角色集合：
   - `PurchaseRequestAdmin` - 管理员角色
   - `PurchaseRequestUser` - 用户角色
4. 将用户分配到相应的角色集合

## 🔍 验证部署

### 检查CF应用状态

```powershell
# 查看所有应用
cf apps

# 查看特定应用详情
cf app purchase-request-srv

# 查看应用日志
cf logs purchase-request-srv --recent
```

### 访问应用

1. 在Work Zone中打开您的Site
2. 点击 Purchase Request 应用图标
3. 应用应该正常加载

## 🛠️ 故障排除

### 问题1: MTA构建失败

```powershell
# 清理并重新构建
Remove-Item -Recurse -Force mta_archives, gen -ErrorAction SilentlyContinue
npm install
mbt build
```

### 问题2: 部署时内存不足

编辑 `mta.yaml`，增加内存配置：

```yaml
parameters:
  memory: 1024M  # 增加到1GB
```

### 问题3: 应用在Work Zone中不显示

1. 确认应用已成功部署：`cf apps`
2. 刷新Content Provider
3. 检查Role Collection是否正确分配
4. 清除浏览器缓存

### 问题4: 认证失败

1. 检查 `xs-security.json` 配置
2. 确认用户已分配正确的角色
3. 重新部署XSUAA服务

## 📊 监控和日志

```powershell
# 实时查看日志
cf logs purchase-request-srv

# 查看最近日志
cf logs purchase-request-srv --recent

# 查看应用事件
cf events purchase-request-srv

# 查看应用环境变量
cf env purchase-request-srv
```

## 🔄 更新应用

当您更新代码后：

```powershell
# 重新构建和部署
.\deploy.ps1

# 或者只部署特定模块
cf deploy mta_archives/*.mtar -m purchase-request-srv
```

## 📚 相关资源

- [SAP BTP文档](https://help.sap.com/docs/btp)
- [Work Zone文档](https://help.sap.com/docs/build-work-zone-standard-edition)
- [CAP文档](https://cap.cloud.sap/docs/)
- [UI5文档](https://ui5.sap.com/)

## 💡 提示

1. **首次部署时间较长** - 可能需要10-20分钟，因为要创建所有服务实例
2. **使用开发空间** - 建议先在dev空间测试，再部署到生产环境
3. **定期备份** - 在重大更新前备份数据库
4. **监控配额** - 注意CF空间的内存和服务配额

## ❓ 需要帮助？

如果遇到问题：
1. 检查CF日志：`cf logs <app-name> --recent`
2. 检查应用状态：`cf apps`
3. 查看服务状态：`cf services`
4. 查阅SAP Community：https://community.sap.com/
