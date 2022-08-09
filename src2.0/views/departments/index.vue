<template>
  <div class="dashboard-container">
    <div class="app-container">
      <!--  上方卡面试图-->
      <el-card class="box-card-title">
        <tree-tool :is-root="true" :tree-data="company" />
      </el-card>
      <!-- 树形结构-->
      <el-tree :data="departs" :default-expand-all="true" :props="defaultProps">
        <!-- 传入内容 插槽内容 会循环多次 有多少节点 就循环多少次 -->
        <!-- 作用域插槽 slot-scope="obj" 接收传递给插槽的数据   data 每个节点的数据对象-->
        <template v-slot="{ data }">
          <tree-tool
            :is-root="false"
            :tree-data="data"
            @addDepts="addDepts"
            @getDepartments="getDepartments"
          />
        </template>
      </el-tree>
    </div>
    <!-- 放置新增弹层组件  -->
    <AddDept
      :show-dialog.sync="showDialog"
      :tree-node="node"
      @addDepts="getDepartments"
    />
  </div>
</template>

<script>
import TreeTool from '@/views/departments/components/tree-tool'
import { getDepartments } from '@/api/departments'
import { tranListToTreeDataNew } from '@/utils'
import AddDept from '@/views/departments/components/add-dept'

export default {
  components: { TreeTool, AddDept },
  data() {
    return {
      defaultProps: {
        label: 'name'
      },
      departs: [
        {
          name: '总裁办',
          manager: '曹操',
          children: [{ name: '董事会', manager: '曹丕' }]
        },
        { name: '行政部', manager: '刘备' },
        { name: '人事部', manager: '孙权' }
      ],
      company: { name: '江苏传智播客教育科技股份有限公司', manager: '负责人' },
      showDialog: false, // 显示窗体
      node: {}
    }
  },
  created() {
    this.getDepartments()
  },
  methods: {
    // 获取列表
    async getDepartments() {
      const result = await getDepartments()
      this.company = { name: result.companyName, manager: '负责人', id: '' }
      this.departs = tranListToTreeDataNew(result.depts, '')
    },
    addDepts(node) {
      this.showDialog = true // 显示弹层
      // 因为node是当前的点击的部门， 此时这个部门应该记录下来,
      console.log(node)
      this.node = node
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  width: 900px;
  //border: 1px solid #ccc;
  margin: 20px auto;

  .box-card-title {
    background: #99ccff;
  }
}
</style>
