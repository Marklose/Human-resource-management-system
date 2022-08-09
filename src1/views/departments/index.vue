<template>
  <div class="dashboard-container">
    <div class="app-container">
      <!--  上方卡面试图-->
      <el-card class="box-card-title">
        <el-row type="flex">
          <el-col>
            <span>江苏传智播客教育科技股份有限公司</span>
          </el-col>
          <el-col :span="6">
            <span>负责人</span>
            <el-dropdown class="thedown">
              <span class="el-dropdown-link">
                操作<i class="el-icon-arrow-down el-icon--right" />
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item>黄金糕</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </el-col>
        </el-row>
      </el-card>
      <!-- 树形结构-->
      <el-tree :data="departs" :props="defaultProps" :default-expand-all="true">
        <!-- 传入内容 插槽内容 会循环多次 有多少节点 就循环多少次 -->
        <!-- 作用域插槽 slot-scope="obj" 接收传递给插槽的数据   data 每个节点的数据对象-->
        <template v-slot="{data}">
          <el-row justify="space-between" align="middle" type="flex" style="width: 100%">
            <el-col>
              <span>{{ data.name }}</span>
            </el-col>
            <el-col :span="6">
              <span>{{ data.manager }}</span>
              <el-dropdown class="thedown">
                <span class="el-dropdown-link">
                  操作<i class="el-icon-arrow-down el-icon--right" />
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item>编辑</el-dropdown-item>
                  <el-dropdown-item>删除</el-dropdown-item>
                  <el-dropdown-item>添加</el-dropdown-item>

                </el-dropdown-menu>
              </el-dropdown>
            </el-col>
          </el-row>
        </template>
      </el-tree>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      defaultProps: {
        label: 'name'
      },
      departs: [{ name: '总裁办', manager: '曹操', children: [{ name: '董事会', manager: '曹丕' }] },
        { name: '行政部', manager: '刘备' },
        { name: '人事部', manager: '孙权' }]
    }
  }
}
</script>

<style scoped lang="scss">
.dashboard-container {
  width: 900px;
  //border: 1px solid #ccc;
  margin: 20px auto;

  .box-card-title {
    background: #99ccff;
  }

  .thedown {
    margin-left: 20px;
  }
}
</style>

