<template>
  <div class="add-exam-component-box">
    <div class="add-exam-component">
      <!-- 竞赛信息模块 -->
      <div class="exam-base-info-box">
        <!-- 标题 -->
        <div class="exam-base-title">
          <span class="base-title">{{ type === 'edit' ? '编辑竞赛' : '添加竞赛' }}</span>
          <span class="go-back" @click="goBack">返回</span>
        </div>
        <!-- 基本信息 -->
        <div class="exam-base-info">
          <div class="group-box">
            <div class="group-item">
              <div class="item-label required">竞赛名称</div>
              <div>
                <el-input v-model="formExam.title" style="width:420px" placeholder="请填写竞赛名称"></el-input>
              </div>
            </div>
          </div>
          <div class="group-box">
            <div class="group-item">
              <div class="item-label required">竞赛周期</div>
              <div>
                <el-date-picker v-model="formExam.examDate" :disabledDate="disabledDate" type="datetimerange"
                  start-placeholder="竞赛开始时间" end-placeholder="竞赛结束时间" value-format="YYYY-MM-DD HH:mm:ss"/>
              </div>
            </div>
          </div>
          <div class="group-box">
            <div class="group-item">
              <el-button class="exam-base-info-button" type="primary" plain @click="saveBaseInfo">保存</el-button>
            </div>
          </div>
        </div>
      </div>
      <!-- 添加竞赛题目 -->
      <div class="exam-select-question-box">
        <el-button class="exam-add-question" :icon="Plus" type="text" @click="addQuestion(formExam.examId)">
          添加题目
        </el-button>
        <el-table height="136px" :data="formExam.examQuestionList" class="question-select-list">
          <el-table-column prop="questionId" width="180px" label="题目id" />
          <el-table-column prop="title" :show-overflow-tooltip="true" label="题目标题" />
          <el-table-column prop="difficulty" width="80px" label="题目难度">
            <template #default="{ row }">
              <div v-if="row.difficulty === 1" style="color:#3EC8FF;">简单</div>
              <div v-if="row.difficulty === 2" style="color:#FE7909;">中等</div>
              <div v-if="row.difficulty === 3" style="color:#FD4C40;">困难</div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80px">
            <template #default="{ row }">
              <el-button circle type="text" @click="deleteExamQuestion(formExam.examId, row.questionId)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 题目配置模块 题目列表勾选加序号 -->
      <div>
        <el-dialog v-model="dialogVisible">
          <div class="exam-list-box">
            <div class="exam-list-title required">选择竞赛题目</div>
            <el-form inline="true">
              <el-form-item label="题目难度">
                <selector v-model="params.difficulty" style="width: 120px;"></selector>
              </el-form-item>
              <el-form-item label="题目名称">
                <el-input v-model="params.title" placeholder="请您输入要搜索的题目标题" />
              </el-form-item>
              <el-form-item>
                <el-button @click="onSearch" plain>搜索</el-button>
                <el-button @click="onReset" plain type="info">重置</el-button>
              </el-form-item>

            </el-form>
            <!-- 题目列表 -->
            <el-table :data="questionList" @select="handleRowSelect" :selectable="selectableMethod">
              <el-table-column :selectable="selectInit" type="selection" width="80px"></el-table-column>
              <el-table-column prop="questionId" label="题目id" />
              <el-table-column prop="title" label="题目标题" />
              <el-table-column prop="difficulty" label="题目难度">
                <template #default="{ row }">
                  <div v-if="row.difficulty === 1" style="color:#3EC8FF;">简单</div>
                  <div v-if="row.difficulty === 2" style="color:#FE7909;">中等</div>
                  <div v-if="row.difficulty === 3" style="color:#FD4C40;">困难</div>
                </template>
              </el-table-column>
            </el-table>
            <!-- 分页区域 -->
            <div class="exam-question-list-button">
              <el-pagination background size="small" layout="total, sizes, prev, pager, next, jumper" :total="total"
                v-model:current-page="params.pageNum" v-model:page-size="params.pageSize"
                :page-sizes="[1, 5, 10, 15, 20]" @size-change="handleSizeChange"
                @current-change="handleCurrentChange" />
              <el-button class="question-select-submit" type="primary" plain
                @click="submitSelectQuestion()">提交</el-button>
            </div>
          </div>
        </el-dialog>
      </div>

      <!-- 提交任务区域 -->
      <div class="submit-box absolute">
        <el-button type="info" plain @click="goBack">取消</el-button>
        <el-button type="primary" plain @click="publishExam">发布竞赛</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { examAddService,addExamQuestionService, getExamDetailService } from "@/apis/exam"
import { getQuestionListService } from "@/apis/question"
import Selector from "@/components/QuestionSelector.vue"
import router from '@/router'
import { reactive, ref } from "vue"
import { Plus } from '@element-plus/icons-vue'
import { useRoute } from 'vue-router';

const type = useRoute().query.type
const formExam = reactive({
  examId: '',
  title: '',
  examDate: ''
})

const params = reactive({
  pageNum: 1,
  pageSize: 10,
  difficulty: '',
  title: ''
})


function goBack() {
  router.go(-1)
}

async function saveBaseInfo() {
  const fd = new FormData()
  for (let key in formExam) {
    if (key === 'examDate') {
      fd.append('startTime', formExam.examDate[0]);
      fd.append('endTime', formExam.examDate[1]);
    } else {
      fd.append(key, formExam[key])
    }
  }
  const addRes = await examAddService(fd)
  formExam.examId = addRes.data
  ElMessage.success('基本信息保存成功')
}

const questionList = ref([])
const total = ref(0)

async function getQuestionList() {
  const result = await getQuestionListService(params)
  console.log(result)
  questionList.value = result.rows
  total.value = result.total
}

const dialogVisible = ref(false)

function addQuestion() {
  if (formExam.examId === null || formExam.examId === '') {
    ElMessage.error('请先保存竞赛基本信息')
  } else {
    getQuestionList()
    dialogVisible.value = true
  }
}

function handleSizeChange() {
  params.pageNum = 1
  getQuestionList()
}

function handleCurrentChange() {
  getQuestionList()
}

function onSearch(){
  params.pageNum = 1
  getQuestionList()
}

function onReset(){
  params.pageNum = 1
  params.pageSize = 10
  params.title = ''
  params.difficulty = ''
  getQuestionList()
}

const questionIdSet = ref([])

function handleRowSelect(selection) {
  questionIdSet.value = []
  selection.forEach(element => {
    questionIdSet.value.push(element.questionId)
  });
}

async function submitSelectQuestion() {
  if (questionIdSet.value && questionIdSet.value.length < 1) {
    ElMessage.error('请先选择要提交的题目')
    return false
  }
  const examQ = reactive({
    examId: formExam.examId,
    questionIdSet: questionIdSet.value
  })
  console.log(examQ)
  await addExamQuestionService(examQ);
  dialogVisible.value = false
  ElMessage.success('竞赛题目添加成功')
}

async function getExamDetail() {
  const examId = useRoute().query.examId
  if(examId) {
    formExam.examId = examId
    const examDetail = await getExamDetailService(examId)
    Object.assign(formExam, examDetail.data)
    formExam.examDate = [examDetail.data.startTime, examDetail.data.endTime]
  }
}

getExamDetail()

</script>

<style lang="scss" scoped>
.add-exam-component-box {
  background-color: #fff;
  padding: 24px;
  min-height: 100%;
  box-sizing: border-box;
  border-radius: 4px;

  /* 顶部标题栏 */
  .exam-base-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 16px;
    border-bottom: 1px solid #f0f2f5;
    margin-bottom: 24px;

    .base-title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }

    .go-back {
      font-size: 14px;
      color: #909399;
      cursor: pointer;
      transition: color 0.2s;

      &:hover {
        color: #409eff;
      }
    }
  }

  /* 表单区域 */
  .exam-base-info {
    max-width: 800px;
    
    .group-box {
      margin-bottom: 24px;

      .group-item {
        display: flex;
        align-items: flex-start; /* 顶部对齐 */

        .item-label {
          width: 100px;
          text-align: right;
          margin-right: 20px;
          font-size: 14px;
          color: #606266;
          line-height: 32px; /* 与 Element 输入框高度一致 */
          flex-shrink: 0;

          &.required::before {
            content: '*';
            color: #f56c6c;
            margin-right: 4px;
          }
        }
      }
    }
    
    .exam-base-info-button {
       margin-left: 120px; /* Label宽度(100) + Margin(20) */
    }
  }

  /* 题目选择区域 */
  .exam-select-question-box {
    margin-top: 40px;
    padding-top: 24px;
    border-top: 1px dashed #dcdfe6;

    .exam-add-question {
      font-size: 14px;
      margin-bottom: 16px;
      font-weight: 500;
    }
    
    .question-select-list {
        width: 100%;
        margin-bottom: 20px;
        border: 1px solid #ebeef5;
        border-radius: 4px;
    }
  }

  /* 底部操作按钮 */
  .submit-box {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 40px;
    padding: 20px 0;
    gap: 20px;
    
    &.absolute {
        position: static; /* 覆盖原来的绝对定位，使用流式布局更稳定 */
    }
  }
}

/* 弹窗内部样式 */
.exam-list-box {
  .exam-list-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 20px;
    padding-left: 10px;
    border-left: 4px solid #409eff;
    
    &.required::after {
      content: ' (请勾选题目)';
      color: #909399;
      font-size: 12px;
      font-weight: normal;
      margin-left: 8px;
    }
  }
  
  .exam-question-list-button {
      margin-top: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
  }
}
</style>