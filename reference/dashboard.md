package dashboard

type DashboardStatsResponse struct {
	TotalProducts   int64   `json:"totalProducts"`
	TotalBrands     int64   `json:"totalBrands"`
	TotalCategories int64   `json:"totalCategories"`
	TotalCustomers  int64   `json:"totalCustomers"`
	TotalOrders     int64   `json:"totalOrders"`
	TotalRevenue    float64 `json:"totalRevenue"`
}

type RecentOrderResponse struct {
	ID          string  `json:"id"`
	OrderNumber string  `json:"orderNumber"`
	TotalAmount float64 `json:"totalAmount"`
	Status      string  `json:"status"`
	Customer    string  `json:"customer"`
	Date        string  `json:"date"`
}

type CategoryDistributionResponse struct {
	CategoryName string `json:"categoryName"`
	Count        int64  `json:"count"`
}

type DashboardResponse struct {
	Stats                DashboardStatsResponse         `json:"stats"`
	RecentOrders         []RecentOrderResponse          `json:"recentOrders"`
	CategoryDistribution []CategoryDistributionResponse `json:"categoryDistribution"`
}

-----

func RegisterRoutes(r *gin.RouterGroup, h *Handler) {
	dashboardGroup := r.Group("/dashboard")
	{
		dashboardGroup.GET("", h.GetDashboard)
	}
}
----
func (h *Handler) GetDashboard(c *gin.Context) {
	res, err := h.service.GetDashboardData(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.JSON(http.StatusOK, res)
}