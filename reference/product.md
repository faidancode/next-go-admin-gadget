## DTO

package product

import "time"

// ==================== REQUEST STRUCTS ====================

// ListPublicQuery Bind query string (Handler)
// ListPublicRequest Business input (service)

type ListPublicRequest struct {
	Page        int
	Limit       int
	Search      string
	BrandSlug   string
	CategoryIDs []string
	MinPrice    float64
	MaxPrice    float64
	SortBy      string
}

type ListPublicQuery struct {
	Page        int      `form:"page,default=1"`
	Limit       int      `form:"limit,default=10"`
	Search      string   `form:"search"`
	BrandSlug   string   `form:"brandSlug"`
	CategoryIDs []string `form:"category_ids"`
	MinPrice    float64  `form:"min_price"`
	MaxPrice    float64  `form:"max_price"`
	SortBy      string   `form:"sort_by,default=newest"`
}

type ListProductAdminRequest struct {
	Page     int
	Limit    int
	Search   string
	Category string
	SortBy   string
	SortDir  string // asc | desc
}

type ListAdminQuery struct {
	Page       int    `form:"page,default=1"`
	Limit      int    `form:"limit,default=10"`
	Search     string `form:"search"`
	CategoryID string `form:"category_id"`
	SortBy     string `form:"sort_by,default=created_at"`
	SortDir    string `form:"sort_dir,default=desc"` // asc | desc
}

type CreateProductRequest struct {
	CategoryID  string  `json:"categoryId" validate:"required"`
	Name        string  `json:"name" validate:"required"`
	Description string  `json:"description"`
	Price       float64 `json:"price" validate:"required,gt=0"`
	Stock       int32   `json:"stock" validate:"required,min=0"`
	SKU         string  `json:"sku"`
	ImageUrl    string  `json:"imageUrl"`
}

type UpdateProductRequest struct {
	CategoryID  string  `json:"categoryId"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Price       float64 `json:"price" validate:"omitempty,gt=0"`
	Stock       int32   `json:"stock" validate:"omitempty,min=0"`
	SKU         string  `json:"sku"`
	ImageUrl    string  `json:"imageUrl"`
	IsActive    *bool   `json:"isActive"` // Tetap menggunakan pointer untuk opsionalitas
}

// ==================== RESPONSE STRUCTS ====================

// ProductPublicResponse untuk list produk (ringkas)
type ProductPublicResponse struct {
	ID           string  `json:"id"`
	CategoryId   string  `json:"categoryId"`
	CategoryName string  `json:"categoryName"`
	Name         string  `json:"name"`
	Slug         string  `json:"slug"`
	Price        float64 `json:"price"`
	ImageURL     string  `json:"imageUrl,omitempty"`
}

// ProductDetailResponse untuk detail produk dengan reviews
type ProductDetailResponse struct {
	ID             string            `json:"id"`
	Name           string            `json:"name"`
	Slug           string            `json:"slug"`
	Description    string            `json:"description"`
	Price          float64           `json:"price"`
	Stock          int32             `json:"stock"`
	CategoryID     string            `json:"categoryId,omitempty"`
	CategoryName   string            `json:"categoryName,omitempty"`
	BrandID        string            `json:"brandId,omitempty"`
	BrandName      string            `json:"brandName,omitempty"`
	ImageURL       string            `json:"imageUrl,omitempty"`
	SKU            string            `json:"sku,omitempty"`
	Specifications map[string]string `json:"specifications,omitempty"`

	// Review fields
	Reviews       []ReviewSummary `json:"reviews"`
	AverageRating float64         `json:"averageRating"`
	RatingCount   int64           `json:"ratingCount"`

	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// ReviewSummary for product detail (5 reviews terbaru)
type ReviewSummary struct {
	ID        string    `json:"id"`
	UserName  string    `json:"userName"`
	Rating    int32     `json:"rating"`
	Comment   string    `json:"comment"`
	CreatedAt time.Time `json:"createdAt"`
}

// ProductAdminResponse untuk dashboard admin
type ProductAdminResponse struct {
	ID           string    `json:"id"`
	CategoryName string    `json:"categoryName"`
	Name         string    `json:"name"`
	Slug         string    `json:"slug"`
	Price        float64   `json:"price"`
	Stock        int32     `json:"stock"`
	SKU          string    `json:"sku"`
	ImageURL     string    `json:"imageUrl,omitempty"`
	IsActive     bool      `json:"isActive"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

type EligibilityResponse struct {
	CanReview bool   `json:"canReview"`
	Reason    string `json:"reason,omitempty"`
}


## Handler
package product

import (
	"context"
	"fmt"
	"go-gadget-api/internal/pkg/apperror"
	"go-gadget-api/internal/pkg/httpx"
	"go-gadget-api/internal/pkg/response"
	"log"
	"mime/multipart"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ReviewService interface {
	CheckEligibility(
		ctx context.Context,
		userID string,
		productSlug string,
	) (EligibilityResponse, error)
}

type Handler struct {
	productService Service
	reviewService  ReviewService
}

func NewHandler(
	productService Service,
	reviewService ReviewService,
) *Handler {
	return &Handler{
		productService: productService,
		reviewService:  reviewService,
	}
}

// 1. GET PUBLIC LIST (Customers)
func (h *Handler) GetPublicList(c *gin.Context) {
	var q ListPublicQuery
	if err := c.ShouldBindQuery(&q); err != nil {
		response.Error(c, http.StatusBadRequest, "INVALID_QUERY", "Query tidak valid", err.Error())
		return
	}

	brandSlug := q.BrandSlug
	if brandSlug == "" {
		brandSlug = c.Query("brand_slug")
	}

	req := ListPublicRequest{
		Page:        q.Page,
		Limit:       q.Limit,
		Search:      q.Search,
		BrandSlug:   brandSlug,
		CategoryIDs: q.CategoryIDs,
		MinPrice:    q.MinPrice,
		MaxPrice:    q.MaxPrice,
		SortBy:      q.SortBy,
	}

	data, total, err := h.productService.ListPublic(c.Request.Context(), req)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "FETCH_ERROR", "Gagal mengambil data produk", err.Error())
		return
	}

	response.Success(c, http.StatusOK, data, h.makePagination(q.Page, q.Limit, total))
}

// 2. GET ADMIN LIST (Dashboard)
func (h *Handler) GetAdminList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	sort := httpx.ParseSort(c, "created_at", "desc")

	req := ListProductAdminRequest{
		Page:     page,
		Limit:    limit,
		Search:   c.Query("search"),
		Category: c.Query("category_id"),
		SortBy:   sort.SortBy,
		SortDir:  sort.SortDir,
	}

	data, total, err := h.productService.ListAdmin(c.Request.Context(), req)
	if err != nil {
		response.Error(
			c,
			http.StatusInternalServerError,
			"FETCH_ERROR",
			"Gagal mengambil data dashboard produk",
			err.Error(),
		)
		return
	}

	response.Success(
		c,
		http.StatusOK,
		data,
		h.makePagination(page, limit, total),
	)
}

func (h *Handler) Create(c *gin.Context) {
	// 1. Parse multipart form (max 10 MB)
	if err := c.Request.ParseMultipartForm(10 << 20); err != nil {
		response.Error(c, http.StatusBadRequest, "INVALID_FORM", "Invalid multipart form", err.Error())
		return
	}

	// 2. Parse form values secara MANUAL (Seperti di Category)
	var price float64
	fmt.Sscanf(c.PostForm("price"), "%f", &price)

	var stock int32
	fmt.Sscanf(c.PostForm("stock"), "%d", &stock)

	req := CreateProductRequest{
		CategoryID:  c.PostForm("categoryId"),
		Name:        c.PostForm("name"),
		Description: c.PostForm("description"),
		SKU:         c.PostForm("sku"),
		Price:       price,
		Stock:       stock,
	}

	// Debug log setelah diisi manual
	log.Printf("Received CreateProductRequest: %+v", req)

	// 3. Handle optional file upload
	var (
		file     multipart.File
		filename string
	)
	fileHeader, err := c.FormFile("image")
	if err == nil && fileHeader != nil {
		openedFile, err := fileHeader.Open()
		if err != nil {
			response.Error(c, http.StatusBadRequest, "FILE_ERROR", "Failed to open file", err.Error())
			return
		}
		defer openedFile.Close()
		file = openedFile
		filename = fileHeader.Filename
	}

	// 4. Call service
	result, err := h.productService.Create(c.Request.Context(), req, file, filename)
	if err != nil {
		// Gunakan helper apperror.ToHTTP agar error mapping Anda berjalan
		httpErr := apperror.ToHTTP(err)
		response.Error(c, httpErr.Status, httpErr.Code, httpErr.Message, err.Error())
		return
	}

	response.Success(c, http.StatusCreated, result, nil)
}

// 4. GET BY ID (Admin / Detail)
func (h *Handler) GetByID(c *gin.Context) {
	res, err := h.productService.GetByID(c.Request.Context(), c.Param("id"))
	if err != nil {
		response.Error(
			c,
			http.StatusNotFound,
			"NOT_FOUND",
			"Produk tidak ditemukan",
			nil,
		)
		return
	}

	response.Success(c, http.StatusOK, res, nil)
}

func (h *Handler) GetBySlug(c *gin.Context) {
	res, err := h.productService.GetBySlug(c.Request.Context(), c.Param("slug"))
	if err != nil {
		response.Error(
			c,
			http.StatusNotFound,
			"NOT_FOUND",
			"Produk tidak ditemukan",
			nil,
		)
		return
	}

	response.Success(c, http.StatusOK, res, nil)
}

func (h *Handler) CheckReviewEligibility(c *gin.Context) {
	userID, _ := c.Get("user_id")
	userIDStr, _ := userID.(string)
	productSlug := c.Param("slug")

	res, err := h.reviewService.CheckEligibility(c.Request.Context(), userIDStr, productSlug)
	if err != nil {
		httpErr := apperror.ToHTTP(err)
		response.Error(c, httpErr.Status, httpErr.Code, httpErr.Message, nil)
		return
	}

	response.Success(c, http.StatusOK, res, nil)
}

// 5. UPDATE PRODUCT
func (h *Handler) Update(c *gin.Context) {
	id := c.Param("id")

	// 1. Parse multipart form
	err := c.Request.ParseMultipartForm(10 << 20) // 10 MB max
	if err != nil {
		response.Error(
			c,
			http.StatusBadRequest,
			"INVALID_FORM",
			"Invalid multipart form",
			err.Error(),
		)
		return
	}

	// 2. Parse form fields (all optional for update)
	req := UpdateProductRequest{
		CategoryID:  c.PostForm("category_id"),
		Name:        c.PostForm("name"),
		Description: c.PostForm("description"),
		SKU:         c.PostForm("sku"),
	}

	// Parse numeric fields
	if priceStr := c.PostForm("price"); priceStr != "" {
		var price float64
		_, err := fmt.Sscanf(priceStr, "%f", &price)
		if err == nil {
			req.Price = price
		}
	}

	if stockStr := c.PostForm("stock"); stockStr != "" {
		var stock int32
		_, err := fmt.Sscanf(stockStr, "%d", &stock)
		if err == nil {
			req.Stock = stock
		}
	}

	if isActiveStr := c.PostForm("is_active"); isActiveStr != "" {
		isActive := isActiveStr == "true"
		req.IsActive = &isActive
	}

	// 3. Get uploaded file (optional)
	var file multipart.File
	var filename string
	fileHeader, err := c.FormFile("image")
	if err == nil && fileHeader != nil {
		file, err = fileHeader.Open()
		if err != nil {
			response.Error(c, http.StatusBadRequest, "FILE_ERROR", "Failed to open uploaded file", err.Error())
			return
		}
		defer file.Close()
		filename = fileHeader.Filename
	}

	// 4. Call service
	res, err := h.productService.Update(c.Request.Context(), id, req, file, filename)
	if err != nil {
		httpErr := apperror.ToHTTP(err)
		response.Error(c, httpErr.Status, httpErr.Code, httpErr.Message, nil)
		return
	}

	response.Success(c, http.StatusOK, res, nil)
}

// 6. DELETE PRODUCT (Soft Delete)
func (h *Handler) Delete(c *gin.Context) {
	id := c.Param("id")

	err := h.productService.Delete(c.Request.Context(), id)
	if err != nil {
		// Mapping error dari service ke HTTP error
		// Jika err adalah ErrProductNotFound, mapping ini harus menghasilkan status 404
		httpErr := apperror.ToHTTP(err)

		response.Error(c, httpErr.Status, httpErr.Code, httpErr.Message, nil)
		return
	}

	response.Success(c, http.StatusOK, nil, nil)
}

// 7. RESTORE PRODUCT
func (h *Handler) Restore(c *gin.Context) {
	res, err := h.productService.Restore(c.Request.Context(), c.Param("id"))
	if err != nil {
		response.Error(
			c,
			http.StatusInternalServerError,
			"RESTORE_ERROR",
			"Gagal mengembalikan produk",
			err.Error(),
		)
		return
	}

	response.Success(c, http.StatusOK, res, nil)
}

// Helper: Pagination Meta
func (h *Handler) makePagination(page, limit int, total int64) *response.PaginationMeta {
	totalPages := 0
	if limit > 0 {
		totalPages = int((total + int64(limit) - 1) / int64(limit))
	}

	return &response.PaginationMeta{
		Total:      total,
		TotalPages: totalPages,
		Page:       page,
		PageSize:   limit,
	}
}


## Routes
adminProducts := r.Group("/admin/products")
	adminProducts.Use(middleware.AuthMiddleware())
	adminProducts.Use(middleware.RoleMiddleware("ADMIN", "SUPERADMIN"))
	{
		// Dashboard Admin biasanya butuh rps lebih tinggi untuk operasional
		adminProducts.GET("",
			middleware.RateLimitByUser(10, 20),
			handler.GetAdminList,
		)

		adminProducts.GET("/:id",
			middleware.RateLimitByUser(10, 20),
			handler.GetByID,
		)

		// Create, Update, Delete, Restore (Ketat)
		// Mencegah ketidaksengajaan double-click atau script malfungsi yang merusak data.
		// limit 1 rps, burst 3
		adminMutationLimit := middleware.RateLimitByUser(1, 3)

		adminProducts.POST("", adminMutationLimit, handler.Create)
		adminProducts.PATCH("/:id", adminMutationLimit, handler.Update)
		adminProducts.DELETE("/:id", adminMutationLimit, handler.Delete)
		adminProducts.PATCH("/:id/restore", adminMutationLimit, handler.Restore)
	}