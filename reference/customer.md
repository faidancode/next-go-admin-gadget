## DTO

package customer

type UpdateProfileRequest struct {
	Name            *string `json:"name"`
	Password        *string `json:"password"`
	CurrentPassword *string `json:"current_password"`
}

type CustomerResponse struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

type CustomerListResponse struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Email     string `json:"email"`
	Phone     string `json:"phone"`
	IsActive  bool   `json:"is_active"`
	CreatedAt string `json:"created_at"`
}

type UpdateStatusRequest struct {
	IsActive bool `json:"is_active" validate:"required"`
}

type CustomerDetailResponse struct {
	ID        string            `json:"id"`
	Name      string            `json:"name"`
	Email     string            `json:"email"`
	Phone     string            `json:"phone"`
	IsActive  bool              `json:"is_active"`
	CreatedAt string            `json:"created_at"`
	Addresses []AddressResponse `json:"addresses,omitempty"`
	Orders    []OrderResponse   `json:"orders,omitempty"`
}

type AddressResponse struct {
	ID           string `json:"id"`
	AddressName  string `json:"address_name"`
	ReceiverName string `json:"receiver_name"`
	Phone        string `json:"phone"`
	FullAddress  string `json:"full_address"`
	IsMain       bool   `json:"is_main"`
}

type OrderResponse struct {
	ID          string `json:"id"`
	OrderNumber string `json:"order_number"`
	TotalAmount int    `json:"total_amount"`
	Status      string `json:"status"`
	CreatedAt   string `json:"created_at"`
}


## Routes
package customer

import (
	"go-gadget-api/internal/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.RouterGroup, h *Handler) {
	customerGroup := r.Group("customers")
	customerGroup.Use(
		middleware.AuthMiddleware(),
	)
	{
		// Update profile biasanya jarang dilakukan.
		// 1 rps, burst 3 untuk mencegah spam update.
		customerGroup.PATCH("/profile",
			middleware.RateLimitByUser(1, 3),
			h.UpdateProfile,
		)
	}

	adminCustomerGroup := r.Group("admin/customers")
	adminCustomerGroup.Use(
		middleware.AuthMiddleware(),
		middleware.RoleMiddleware("ADMIN", "SUPERADMIN"),
	)
	{
		// List customer: data bisa banyak, batasi agar tidak scraping.
		adminCustomerGroup.GET("",
			middleware.RateLimitByUser(5, 10),
			h.List,
		)

		adminCustomerGroup.GET("/:id",
			middleware.RateLimitByUser(10, 20),
			h.GetDetails,
		)

		// Toggle status: Operasi kritikal, batasi ketat.
		adminCustomerGroup.PATCH("/:id/status",
			middleware.RateLimitByUser(1, 2),
			h.ToggleStatus,
		)
	}
}


---

func (h *Handler) List(c *gin.Context) {
	res, err := h.service.ListCustomers(c.Request.Context())
	if err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, res)
}

func (h *Handler) ToggleStatus(c *gin.Context) {
	id := c.Param("id")
	var req UpdateStatusRequest
	if err := h.bindJSON(c, &req); err != nil {
		return
	}

	res, err := h.service.ToggleCustomerStatus(c.Request.Context(), id, req.IsActive)
	if err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, res)
}

func (h *Handler) GetDetails(c *gin.Context) {
	id := c.Param("id")
	res, err := h.service.GetCustomerDetails(c.Request.Context(), id)
	if err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, res)
}