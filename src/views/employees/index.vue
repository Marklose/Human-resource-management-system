<template>
  <div class="dashboard-container">
    <div class="app-container">
      <!--      头部组件-->
      <ToolBar>
        <template #before>
          <span>111</span>
        </template>
        <template #after>
          <el-button
            size="small"
            type="primary"
            @click="$router.push('/uploadExcel')"
          >导入
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="Export2Excel"
          >导出
          </el-button>
          <el-button size="small" type="warning" @click="showDialog = true">
            新增员工
          </el-button>
        </template>
      </ToolBar>
      <!--      表格区域-->
      <el-card>
        <el-table :data="list" border>
          <el-table-column label="序号" sortable="" type="index" />
          <el-table-column align="center" label="头像">
            <template slot-scope="{ row }">
              <img
                slot="reference"
                :src="row.staffPhoto"
                alt=""
                style="
                  border-radius: 50%;
                  width: 100px;
                  height: 100px;
                  padding: 10px;
                "
                @click="showQrCode(row.staffPhoto)"
              >
            </template>
          </el-table-column>
          <el-table-column label="姓名" prop="username" sortable="" />
          <el-table-column label="工号" prop="workNumber" sortable="" />
          <el-table-column
            :formatter="formatter"
            label="聘用形式"
            prop="formOfEmployment"
            sortable=""
          />
          <el-table-column label="部门" prop="departmentName" sortable="" />
          <el-table-column label="入职时间" prop="timeOfEntry" sortable="">
            <template slot-scope="{ row }">
              {{ row.timeOfEntry | formatDate }}
            </template>
          </el-table-column>
          <el-table-column label="账户状态" prop="enableState" sortable="" />
          <el-table-column fixed="right" label="操作" sortable="" width="280">
            <template v-slot="{ row }">
              <el-button
                size="small"
                type="text"
                @click="$router.push(`/employees/detail/${row.id}`)"
              >查看
              </el-button>
              <el-button size="small" type="text">转正</el-button>
              <el-button size="small" type="text">调岗</el-button>
              <el-button size="small" type="text">离职</el-button>
              <el-button
                size="small"
                type="text"
                @click="editRole(row.id)"
              >角色
              </el-button>
              <el-button
                :disabled="checkPermission('DELETE_USER')"
                size="small"
                type="text"
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
          <el-pagination
            :current-page.sync="page.page"
            :page-size="page.size"
            :total="total"
            layout="prev, pager, next"
            @current-change="getEmployeeList"
          />
        </el-row>
      </el-card>
    </div>
    <assign-role
      ref="assignRole"
      :show-role-dialog.sync="showRoleDialog"
      :user-id="userId"
    />
    <el-dialog
      :visible.sync="showCodeDialog"
      title="二维码"
      @close="imgUrl = ''"
    >
      <el-row justify="center" type="flex">
        <canvas ref="myCanvas" />
      </el-row>
    </el-dialog>
    <AddEmployee :show-dialog.sync="showDialog" />
  </div>
</template>

<script>
// import ToolBar from '@/components/toolBar'

import { delEmployee, getEmployeeList } from '@/api/employees'
import EmployeeEnum from '@/api/constant/employees'
import AddEmployee from '@/views/employees/components/add-employee'
import { formatDate } from '@/filters'
import QrCode from 'qrcode'
import AssignRole from '@/views/employees/components/assign-role'
import { mixins } from '@/utils/mixins'
// 表头对应关系
const headers = {
  手机号: 'mobile',
  姓名: 'username',
  入职日期: 'timeOfEntry',
  聘用形式: 'formOfEmployment',
  转正日期: 'correctionTime',
  工号: 'workNumber',
  部门: 'departmentName'
}

export default {
  components: { AddEmployee, AssignRole },
  mixins: [mixins],
  data() {
    return {
      showDialog: false, // 弹出层
      list: [], // 接数据的
      page: {
        page: 1, // 当前页码
        size: 10
      },
      total: 0, // 总数
      showCodeDialog: false,
      showRoleDialog: false,
      userId: ''
    }
  },
  created() {
    this.getEmployeeList()
  },
  methods: {
    // 该方法负责将数组转化成二维数组
    formatJson(headers, row) {
      // rows的结构 ->
      // rows: [{username: '234234', mobile: '1398888888', 'workNumber': 123123}, ....]
      // headers的结构 ['姓名', '手机号', '入职日期', ....] -> 配置项里面生效的数据结构
      // rows的预期结果 -> result数组的每一项要和和headers一一对应
      // result -> [['张三', '138888888', '2020-10-01', ...], ['张三', '138888888', '2020-10-01', ...]]
      return row.map((item) => {
        // item 为对象 ->
        // 替换成数组即可 ->
        // 数组的结构要和headers对应起来 ->

        return Object.keys(headers).map((key) => {
          // key -> 中文的key
          // 预期 -> 返回当前项的值
          // 值在哪？-> item为真实的数据对象 -> 取到正确的值返回即可

          // 返回值的思路
          // 1. 数据里面的key是中文还是英文？ -> 英文
          // 2. headers里面取到中文key对应的英文key
          // 3. 直接去数据对象里面取数据
          if (['timeOfEntry', 'correctionTime'].includes(headers[key])) {
            // 格式化日期 -> 已经定义过过滤器直接使用即可
            return formatDate(item[headers[key]])
          }
          if (headers[key] === 'formOfEmployment') {
            // 需要引入EmployeeEnum常量进行处理
            return (
              EmployeeEnum.hireType.find((i) => i.id === item[headers[key]])
                ?.value || '未知'
            )
          }
          return item[headers[key]]
        })
      })
    },
    // 导出
    async Export2Excel() {
      // 懒加载
      const { export_json_to_excel } = await import(
        /* webpackChunkName : "export2Excel"*/ '@/utils/Export2Excel'
      )
      // 1、获取需要导出的数据
      const { rows } = await getEmployeeList({ page: 1, size: this.total })
      // 2、调用自己封装的方法进行数据的转化
      const data = this.formatJson(headers, rows)
      export_json_to_excel({
        header: Object.keys(headers), //  // 表头数组 -> ['姓名', '手机号', '入职日期', '聘用形式', ....]
        data: data, // 具体数据 必填
        filename: 'excel-list', // 非必填
        autoWidth: true, // 非必填
        bookType: 'xlsx' // 非必填
      })
    },
    async getEmployeeList() {
      const { rows, total } = await getEmployeeList(this.page)
      this.total = total
      this.list = rows
    },
    formatter(row, column, cellValue) {
      const obj = EmployeeEnum.hireType.find(
        (item) => item.id === cellValue
      )?.value
      return obj || '未知'
    },
    async del(id) {
      try {
        await this.$confirm('确定删除该员工？')
        await delEmployee(id)
        this.$message.success('删除成功')
        await this.getEmployeeList()
      } catch (e) {
        console.log(e)
      }
    },
    showQrCode(url) {
      // url存在的情况下 才弹出层
      console.log(url)
      if (url) {
        this.showCodeDialog = true // 数据更新了 但是我的弹层会立刻出现吗 ？页面的渲染是异步的！！！！
        // 有一个方法可以在上一次数据更新完毕，页面渲染完毕之后
        this.$nextTick(() => {
          // 此时可以确认已经有ref对象了
          QrCode.toCanvas(this.$refs.myCanvas, url) // 将地址转化成二维码
          // 如果转化的二维码后面信息 是一个地址的话 就会跳转到该地址 如果不是地址就会显示内容
        })
      } else {
        this.$message.warning('该用户还未上传头像')
      }
    },
    async editRole(id) {
      this.userId = id // props传值 是异步的
      await this.$refs.assignRole.getUserDetailById(id) // 父组件调用子组件方法
      this.showRoleDialog = true
    }
  }
}
</script>

<style></style>
