import service from '@/utils/request'

export function getExamListService(params) {
  return service({
    url: "/exam/list",
    method: "get",
    params,
  });
}

// 新增：添加竞赛
export function examAddService(params = {}) {
  return service({
    url: "/exam/add",
    method: "post",
    data: params,
  });
}

export function addExamQuestionService(params = {}) {
  return service({
    url: "/exam/question/add",
    method: "post",
    data: params,
  });
}

export function getExamDetailService(examId) {
  return service({
    url: "/exam/detail",
    method: "get",
    params:{ examId },
  });
}

// 建议一并添加：编辑竞赛（后续可能会用到）
export function examEditService(data) {
  return service({
    url: "/exam/edit",
    method: "put",
    data
  });
}

// 建议一并添加：删除竞赛
export function examDeleteService(examId) {
  return service({
    url: "/exam/delete",
    method: "delete",
    params: { examId }
  });
}