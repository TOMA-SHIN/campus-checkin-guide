const studyService = require('../../utils/studyService');

Page({
  data: {
    subjects: [],
    subjectIndex: -1,
    planName: '',
    targetMinutes: 30,
    startDate: '',
    endDate: '',
    showColorPicker: false,
    selectedColor: '#4CAF50',
    colors: ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336', '#00BCD4', '#795548', '#607D8B'],
  },

  onLoad() {
    this.loadSubjects();
    const today = this.formatDate(new Date());
    this.setData({ startDate: today, endDate: today });
  },

  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  async loadSubjects() {
    try {
      const subjects = await studyService.getSubjects();
      this.setData({ subjects });
    } catch (error) {
      wx.showToast({ title: '加载科目失败', icon: 'none' });
    }
  },

  onSubjectChange(e) {
    this.setData({ subjectIndex: e.detail.value });
  },

  onPlanNameInput(e) {
    this.setData({ planName: e.detail.value });
  },

  onTargetMinutesChange(e) {
    this.setData({ targetMinutes: e.detail.value });
  },

  onStartDateChange(e) {
    this.setData({ startDate: e.detail.value });
  },

  onEndDateChange(e) {
    this.setData({ endDate: e.detail.value });
  },

  showColorPicker() {
    this.setData({ showColorPicker: true });
  },

  hideColorPicker() {
    this.setData({ showColorPicker: false });
  },

  selectColor(e) {
    const color = e.currentTarget.dataset.color;
    this.setData({ selectedColor: color, showColorPicker: false });
  },

  async submitPlan() {
    const { planName, targetMinutes, subjects, subjectIndex, startDate, endDate, selectedColor } = this.data;
    if (!planName.trim()) {
      wx.showToast({ title: '请输入计划名称', icon: 'none' });
      return;
    }
    if (subjectIndex < 0) {
      wx.showToast({ title: '请选择科目', icon: 'none' });
      return;
    }
    try {
      await studyService.addPlan({
        name: planName.trim(),
        subject: subjects[subjectIndex].name,
        targetMinutes: Number(targetMinutes),
        startDate,
        endDate,
        color: selectedColor,
      });
      wx.showToast({ title: '添加成功', icon: 'success' });
      setTimeout(() => {
        wx.switchTab({ url: '/pages/plans/index' });
      }, 1000);
    } catch (error) {
      wx.showToast({ title: error.message || '添加失败', icon: 'none' });
    }
  },
});
