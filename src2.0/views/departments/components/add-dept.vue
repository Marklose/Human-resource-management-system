<template>
  <el-dialog :visible="showDialog" title="新增部门" @close="btnCancel">
    <el-form
      ref="deptForm"
      :model="formData"
      :rules="rules"
      label-width="120px"
    >
      <el-form-item label="部门名称" prop="name">
        <el-input v-model="formData.name" />
      </el-form-item>
      <el-form-item label="部门编码" prop="code">
        <el-input v-model="formData.code" />
      </el-form-item>
      <el-form-item label="部门负责人" prop="manager">
        <el-select
          v-model="formData.manager"
          placeholder="请选择"
          style="width: 100%"
          @focus="getEmployeeSimple"
        >
          <!-- 需要循环生成选项   这里做一下简单的处理 显示的是用户名 存的也是用户名-->
          <el-option
            v-for="item in peoples"
            :key="item.id"
            :label="item.username"
            :value="item.username"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="部门介绍" prop="introduce">
        <el-input v-model="formData.introduce" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button size="small" @click="btnCancel()">取 消</el-button>
        <el-button
          size="small"
          type="primary"
          @click="btnOK()"
        >确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script>
import { addDepartments, getDepartments } from '@/api/departments'
import { getEmployeeSimple } from '@/api/employees'

export default {
  name: 'AddDept',
  props: {
    showDialog: {
      type: Boolean,
      default: false
    },
    // 当前操作的节点
    treeNode: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    // 现在定义一个函数 这个函数的目的是 去找 同级部门下 是否有重复的部门名称
    const checkNameRepeat = async(rules, value) => {
      // 1、 接口获取所有的部门
      const { depts } = await getDepartments()
      // 2、找到当前点击的部门的所有子部门
      const currentNodeChilren = depts.filter(
        (item) => item.pid === this.treeNode.id
      )
      // 3、判断当前部门的所有子部门名称是否包含用户输入的部门名称
      const isRepeat = currentNodeChilren.some((item) => item.name === value)
      // 4、如果包含说明名称重复
      if (isRepeat) {
        return Promise.reject(new Error('部门名称重复'))
      }
      // --> 核心逻辑：用户输入的部门名称跟当前点击的部门的所有的子部门的名称不能重复
    }
    const checkCodeRepeat = async(rules, value) => {
      // 1、 接口获取所有的部门
      const { depts } = await getDepartments()

      //  2、直接判断当前用户添写的code是否包含在已存在的数据里面
      const isRepeat = depts.some((item) => item.code === value)

      if (isRepeat) {
        return Promise.reject('部门code重复')
      }
      // --> 核心逻辑：用户输入的部门code跟任何部门的code都不能重复
    }
    return {
      peoples: [],
      formData: {
        name: '', // 部门名称
        code: '', // 部门编码
        manager: '', // 部门管理者
        introduce: '' // 部门介绍
      },
      // 定义校验规则
      rules: {
        name: [
          { required: true, message: '部门名称不能为空', trigger: 'blur' },
          {
            min: 1,
            max: 50,
            message: '部门名称要求1-50个字符',
            trigger: 'blur'
          },
          {
            trigger: 'blur',
            validator: checkNameRepeat // 自定义函数的形式校验
          }
        ],
        code: [
          { required: true, message: '部门编码不能为空', trigger: 'blur' },
          {
            min: 1,
            max: 50,
            message: '部门编码要求1-50个字符',
            trigger: 'blur'
          },
          {
            trigger: 'blur',
            validator: checkCodeRepeat
          }
        ],
        manager: [
          { required: true, message: '部门负责人不能为空', trigger: 'blur' }
        ],
        introduce: [
          { required: true, message: '部门介绍不能为空', trigger: 'blur' },
          {
            trigger: 'blur',
            min: 1,
            max: 300,
            message: '部门介绍要求1-50个字符'
          }
        ]
      }
    }
  },
  methods: {
    // 获取员工简单列表数据
    async getEmployeeSimple() {
      this.peoples = await getEmployeeSimple()
    },
    // 点击确定时触发
    btnOK() {
      this.$refs.deptForm.validate(async(isOK) => {
        if (isOK) {
          // 表示可以提交了
          await addDepartments({ ...this.formData, pid: this.treeNode.id }) // 调用新增接口 添加父部门的id
          this.$emit('addDepts')
          this.btnCancel()
        }
      })
    },
    btnCancel() {
      this.$refs.deptForm.resetFields() // 重置校验字段
      this.$emit('update:showDialog', false) // 关闭
    }
  }
}
</script>
<style lang="scss" scoped></style>
