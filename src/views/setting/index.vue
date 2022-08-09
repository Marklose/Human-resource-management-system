<template>
  <div class="dashboard-container">
    <div class="app-container">
      <el-card>
        <el-tabs>
          <!-- 放置页签 -->
          <el-tab-pane label="角色管理">
            <!-- 新增角色按钮 -->
            <el-row style="height: 60px">
              <el-button
                icon="el-icon-plus"
                size="small"
                type="primary"
                @click="showDialog = true"
              >新增角色
              </el-button>
            </el-row>
            <!-- 表格 -->
            <el-table :data="list" border>
              <el-table-column label="序号" type="index" width="120" />
              <el-table-column label="角色名称" prop="name" width="240" />
              <el-table-column label="描述" prop="description" />
              <el-table-column label="操作">
                <template slot-scope="{ row }">
                  <el-button
                    size="small"
                    type="success"
                    @click="assignPerm(row.id)"
                  >分配权限
                  </el-button>
                  <el-button
                    size="small"
                    type="primary"
                    @click="edit(row.id)"
                  >编辑
                  </el-button>
                  <el-button
                    size="small"
                    type="danger"
                    @click="del(row.id)"
                  >删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <!-- 分页组件 -->
            <el-row
              align="middle"
              justify="center"
              style="height: 60px"
              type="flex"
            >
              <!-- 分页组件 -->
              <el-pagination
                :current-page="page.page"
                :page-size="page.pagesize"
                :total="total"
                background
                layout="prev, pager, next"
                @current-change="currentChange"
              />
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="公司信息">
            <el-alert
              :closable="false"
              show-icon
              title="对公司名称、公司地址、营业执照、公司地区的更新，将使得公司资料被重新审核，请谨慎修改"
              type="info"
            />
            <el-form
              ref="roleRef"
              disabled
              label-width="120px"
              style="margin-top: 50px"
            >
              <el-form-item label="公司名称">
                <el-input v-model="formData.name" style="width: 400px" />
              </el-form-item>
              <el-form-item label="公司地址">
                <el-input
                  v-model="formData.companyAddress"
                  style="width: 400px"
                />
              </el-form-item>
              <el-form-item label="邮箱">
                <el-input v-model="formData.mailbox" style="width: 400px" />
              </el-form-item>
              <el-form-item label="备注">
                <el-input
                  v-model="formData.remarks"
                  :rows="3"
                  style="width: 400px"
                  type="textarea"
                />
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
    <!-- 编辑弹层 -->
    <el-dialog :visible="showDialog" title="编辑弹层" @close="close">
      <el-form
        ref="roleRef"
        :model="roleForm"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" />
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="roleForm.description" />
        </el-form-item>
      </el-form>
      <!-- 底部 -->
      <el-row slot="footer" justify="center" type="flex">
        <el-col :span="6">
          <el-button size="small" @click="close">取消</el-button>
          <el-button size="small" type="primary" @click="btnOK">确定</el-button>
        </el-col>
      </el-row>
    </el-dialog>
    <el-dialog
      :visible="showPermDialog"
      title="分配权限"
      @close="btnPermCancel"
    >
      <!-- 权限是一颗树 -->
      <!-- 将数据绑定到组件上 -->
      <!-- check-strictly 如果为true 那表示父子勾选时  不互相关联 如果为false就互相关联 -->
      <!-- id作为唯一标识 -->
      <el-tree
        ref="permTree"
        :check-strictly="true"
        :data="permData"
        :default-checked-keys="selectCheck"
        :default-expand-all="true"
        :props="defaultProps"
        :show-checkbox="true"
        node-key="id"
      />
      <!-- 确定 取消 -->
      <el-row slot="footer" justify="center" type="flex">
        <el-col :span="6">
          <el-button
            size="small"
            type="primary"
            @click="btnPermOK"
          >确定
          </el-button>
          <el-button size="small" @click="btnPermCancel">取消</el-button>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
import {
  addRole,
  assignPerm,
  deleteRole,
  getCompanyInfo,
  getRoleDetail,
  getRoleList,
  updateRole
} from '@/api/setting'
import { tranListToTreeData } from '@/utils'
import { getPermissionList } from '@/api/permisson'

export default {
  name: 'Setting',
  data() {
    return {
      showDialog: false,
      roleForm: {
        name: '',
        description: ''
      },
      rules: {
        name: [
          { required: true, message: '角色名称不能为空', trigger: 'blur' }
        ]
      },
      total: 0,
      page: {
        page: 1,
        pagesize: 10
      },
      list: [],
      formData: {},
      showPermDialog: false, // 控制分配权限弹层的显示后者隐藏
      defaultProps: {
        label: 'name'
      },
      permData: [], // 专门用来接收权限数据 树形数据
      selectCheck: [], // 定义一个数组来接收 已经选中的节点
      roleId: null // 用来记录分配角色的id
    }
  },
  created() {
    this.getRoleList()
    this.getCompanyInfo()
  },
  methods: {
    //  获取角色列表
    async getRoleList() {
      const { rows, total } = await getRoleList(this.page)
      this.total = total
      this.list = rows
    },
    currentChange(page) {
      this.page.page = page
      this.getRoleList()
    },
    async getCompanyInfo() {
      this.formData = await getCompanyInfo(this.$store.getters.CompanyId)
    },
    async del(id) {
      try {
        await this.$confirm('确定删除嘛')
        const len = this.list.length
        await deleteRole(id)
        this.$message.success('删除成功')
        if (len === 1 && this.page.page > 1) {
          this.page.page--
        }
        await this.getRoleList()
      } catch (e) {
        console.log(e)
      }
    },
    //  编辑
    async edit(id) {
      this.showDialog = true
      this.roleForm = await getRoleDetail(id)
    },
    // 关闭
    close() {
      this.showDialog = false
      this.roleForm = {
        name: '',
        description: ''
      }
    },
    async btnOK() {
      try {
        await this.$refs.roleRef.validate()
        if (this.roleForm.id) {
          //  编辑
          await updateRole(this.roleForm)
        } else {
          await addRole(this.roleForm)
        }
        this.$message.success('成功')
        await this.getRoleList()
        this.close()
      } catch (e) {
        console.log(e)
      }
    },
    // 点击分配权限
    // 获取权限点数据 在点击的时候调用 获取权限点数据
    async assignPerm(id) {
      this.permData = tranListToTreeData(await getPermissionList(), '0') // 转化list到树形数据
      this.roleId = id
      // 应该去获取 这个id的 权限点
      // 有id 就可以 id应该先记录下来
      const { permIds } = await getRoleDetail(id) // permIds是当前角色所拥有的权限点数据
      this.selectCheck = permIds // 将当前角色所拥有的权限id赋值
      this.showPermDialog = true
    },
    async btnPermOK() {
      // 调用el-tree的方法
      // console.log(this.$refs.permTree.getCheckedKeys())
      await assignPerm({
        permIds: this.$refs.permTree.getCheckedKeys(),
        id: this.roleId
      })
      this.$message.success('分配权限成功')
      this.showPermDialog = false
    },
    btnPermCancel() {
      this.selectCheck = [] // 重置数据
      this.showPermDialog = false
    }
  }
}
</script>

<style></style>
