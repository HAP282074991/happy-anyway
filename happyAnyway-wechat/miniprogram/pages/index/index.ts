import { API_BASE_URL } from '../../config';

Page({
  data: {
    title: 'happyAnyway',
    status: '点击按钮检查后端连接',
    loading: false,
  },
  checkBackend() {
    if (this.data.loading) return;
    this.setData({ loading: true, status: '正在连接…' });
    wx.request<{ status: string }>({
      url: API_BASE_URL + '/actuator/health',
      timeout: 5000,
      success: (response) => {
        const healthy = response.statusCode === 200 && response.data.status === 'UP';
        this.setData({ status: healthy ? '后端连接正常' : '后端暂不可用' });
      },
      fail: () => {
        this.setData({ status: '连接失败，请检查后端服务和请求地址' });
      },
      complete: () => {
        this.setData({ loading: false });
      },
    });
  },
});
