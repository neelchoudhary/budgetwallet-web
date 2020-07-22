// Code generated by protoc-gen-go. DO NOT EDIT.
// source: services/financialcategories/financialCategories.proto

package financialcategories

import (
	context "context"
	fmt "fmt"
	proto "github.com/golang/protobuf/proto"
	grpc "google.golang.org/grpc"
	codes "google.golang.org/grpc/codes"
	status "google.golang.org/grpc/status"
	math "math"
)

// Reference imports to suppress errors if they are not otherwise used.
var _ = proto.Marshal
var _ = fmt.Errorf
var _ = math.Inf

// This is a compile-time assertion to ensure that this generated file
// is compatible with the proto package it is being compiled against.
// A compilation error at this line likely means your copy of the
// proto package needs to be updated.
const _ = proto.ProtoPackageIsVersion3 // please upgrade the proto package

type FinancialCategory struct {
	Id                   int64    `protobuf:"varint,1,opt,name=id,proto3" json:"id,omitempty"`
	Name                 string   `protobuf:"bytes,2,opt,name=name,proto3" json:"name,omitempty"`
	Group                string   `protobuf:"bytes,3,opt,name=group,proto3" json:"group,omitempty"`
	XXX_NoUnkeyedLiteral struct{} `json:"-"`
	XXX_unrecognized     []byte   `json:"-"`
	XXX_sizecache        int32    `json:"-"`
}

func (m *FinancialCategory) Reset()         { *m = FinancialCategory{} }
func (m *FinancialCategory) String() string { return proto.CompactTextString(m) }
func (*FinancialCategory) ProtoMessage()    {}
func (*FinancialCategory) Descriptor() ([]byte, []int) {
	return fileDescriptor_e33c3ac0cef456d7, []int{0}
}

func (m *FinancialCategory) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_FinancialCategory.Unmarshal(m, b)
}
func (m *FinancialCategory) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_FinancialCategory.Marshal(b, m, deterministic)
}
func (m *FinancialCategory) XXX_Merge(src proto.Message) {
	xxx_messageInfo_FinancialCategory.Merge(m, src)
}
func (m *FinancialCategory) XXX_Size() int {
	return xxx_messageInfo_FinancialCategory.Size(m)
}
func (m *FinancialCategory) XXX_DiscardUnknown() {
	xxx_messageInfo_FinancialCategory.DiscardUnknown(m)
}

var xxx_messageInfo_FinancialCategory proto.InternalMessageInfo

func (m *FinancialCategory) GetId() int64 {
	if m != nil {
		return m.Id
	}
	return 0
}

func (m *FinancialCategory) GetName() string {
	if m != nil {
		return m.Name
	}
	return ""
}

func (m *FinancialCategory) GetGroup() string {
	if m != nil {
		return m.Group
	}
	return ""
}

type GetFinancialCategoriesResponse struct {
	FinancialCategories  []*FinancialCategory `protobuf:"bytes,1,rep,name=financial_categories,json=financialCategories,proto3" json:"financial_categories,omitempty"`
	XXX_NoUnkeyedLiteral struct{}             `json:"-"`
	XXX_unrecognized     []byte               `json:"-"`
	XXX_sizecache        int32                `json:"-"`
}

func (m *GetFinancialCategoriesResponse) Reset()         { *m = GetFinancialCategoriesResponse{} }
func (m *GetFinancialCategoriesResponse) String() string { return proto.CompactTextString(m) }
func (*GetFinancialCategoriesResponse) ProtoMessage()    {}
func (*GetFinancialCategoriesResponse) Descriptor() ([]byte, []int) {
	return fileDescriptor_e33c3ac0cef456d7, []int{1}
}

func (m *GetFinancialCategoriesResponse) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_GetFinancialCategoriesResponse.Unmarshal(m, b)
}
func (m *GetFinancialCategoriesResponse) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_GetFinancialCategoriesResponse.Marshal(b, m, deterministic)
}
func (m *GetFinancialCategoriesResponse) XXX_Merge(src proto.Message) {
	xxx_messageInfo_GetFinancialCategoriesResponse.Merge(m, src)
}
func (m *GetFinancialCategoriesResponse) XXX_Size() int {
	return xxx_messageInfo_GetFinancialCategoriesResponse.Size(m)
}
func (m *GetFinancialCategoriesResponse) XXX_DiscardUnknown() {
	xxx_messageInfo_GetFinancialCategoriesResponse.DiscardUnknown(m)
}

var xxx_messageInfo_GetFinancialCategoriesResponse proto.InternalMessageInfo

func (m *GetFinancialCategoriesResponse) GetFinancialCategories() []*FinancialCategory {
	if m != nil {
		return m.FinancialCategories
	}
	return nil
}

type Empty struct {
	XXX_NoUnkeyedLiteral struct{} `json:"-"`
	XXX_unrecognized     []byte   `json:"-"`
	XXX_sizecache        int32    `json:"-"`
}

func (m *Empty) Reset()         { *m = Empty{} }
func (m *Empty) String() string { return proto.CompactTextString(m) }
func (*Empty) ProtoMessage()    {}
func (*Empty) Descriptor() ([]byte, []int) {
	return fileDescriptor_e33c3ac0cef456d7, []int{2}
}

func (m *Empty) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_Empty.Unmarshal(m, b)
}
func (m *Empty) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_Empty.Marshal(b, m, deterministic)
}
func (m *Empty) XXX_Merge(src proto.Message) {
	xxx_messageInfo_Empty.Merge(m, src)
}
func (m *Empty) XXX_Size() int {
	return xxx_messageInfo_Empty.Size(m)
}
func (m *Empty) XXX_DiscardUnknown() {
	xxx_messageInfo_Empty.DiscardUnknown(m)
}

var xxx_messageInfo_Empty proto.InternalMessageInfo

func init() {
	proto.RegisterType((*FinancialCategory)(nil), "financialcategories.FinancialCategory")
	proto.RegisterType((*GetFinancialCategoriesResponse)(nil), "financialcategories.GetFinancialCategoriesResponse")
	proto.RegisterType((*Empty)(nil), "financialcategories.Empty")
}

func init() {
	proto.RegisterFile("services/financialcategories/financialCategories.proto", fileDescriptor_e33c3ac0cef456d7)
}

var fileDescriptor_e33c3ac0cef456d7 = []byte{
	// 269 bytes of a gzipped FileDescriptorProto
	0x1f, 0x8b, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0xff, 0x7c, 0x91, 0x41, 0x4b, 0xc3, 0x30,
	0x1c, 0xc5, 0x6d, 0xeb, 0x14, 0xff, 0x82, 0x60, 0x36, 0x24, 0xec, 0x20, 0xa5, 0x07, 0xe9, 0x65,
	0x2d, 0x6c, 0xe0, 0x07, 0x50, 0x9c, 0xa7, 0x21, 0xd4, 0x93, 0x5e, 0x24, 0x4d, 0xff, 0xb6, 0xc1,
	0x36, 0x09, 0x69, 0xaa, 0x14, 0x3f, 0x80, 0x5f, 0x5b, 0xec, 0x60, 0x8a, 0x0d, 0xbb, 0x25, 0x2f,
	0x79, 0xc9, 0xef, 0xfd, 0x1f, 0x5c, 0xb7, 0x68, 0xde, 0x05, 0xc7, 0x36, 0x7d, 0x15, 0x92, 0x49,
	0x2e, 0x58, 0xcd, 0x99, 0xc5, 0x52, 0x19, 0xf1, 0x57, 0xbb, 0xdd, 0x69, 0x89, 0x36, 0xca, 0x2a,
	0x32, 0x75, 0x5c, 0x8f, 0x36, 0x70, 0xbe, 0xfe, 0xe7, 0xe8, 0xc9, 0x19, 0xf8, 0xa2, 0xa0, 0x5e,
	0xe8, 0xc5, 0x41, 0xe6, 0x8b, 0x82, 0x10, 0x38, 0x94, 0xac, 0x41, 0xea, 0x87, 0x5e, 0x7c, 0x92,
	0x0d, 0x6b, 0x32, 0x83, 0x49, 0x69, 0x54, 0xa7, 0x69, 0x30, 0x88, 0xdb, 0x4d, 0xf4, 0x09, 0x97,
	0xf7, 0x68, 0xd7, 0x63, 0x86, 0x0c, 0x5b, 0xad, 0x64, 0x8b, 0xe4, 0x09, 0x66, 0x3b, 0x8e, 0x97,
	0x5f, 0x10, 0xea, 0x85, 0x41, 0x7c, 0xba, 0xbc, 0x4a, 0x1c, 0x90, 0xc9, 0x88, 0x30, 0x9b, 0x3a,
	0x62, 0x46, 0xc7, 0x30, 0xb9, 0x6b, 0xb4, 0xed, 0x97, 0x5f, 0x1e, 0xd0, 0x91, 0xe7, 0x71, 0x3b,
	0x35, 0xf2, 0x06, 0x17, 0x6e, 0x44, 0x32, 0x77, 0x7e, 0x3e, 0x3c, 0x39, 0x5f, 0x39, 0xcf, 0xf6,
	0x67, 0x8d, 0x0e, 0x6e, 0x1e, 0x9e, 0x37, 0xa5, 0xb0, 0x55, 0x97, 0x27, 0x5c, 0x35, 0xa9, 0x44,
	0xac, 0x79, 0xa5, 0xba, 0xa2, 0x62, 0xa6, 0x4f, 0xf3, 0xae, 0x28, 0xd1, 0x7e, 0xb0, 0xba, 0x46,
	0xbb, 0x60, 0x5a, 0x2c, 0x7e, 0x7a, 0x45, 0x93, 0xee, 0xab, 0x37, 0x3f, 0x1a, 0xba, 0x5c, 0x7d,
	0x07, 0x00, 0x00, 0xff, 0xff, 0x06, 0xcc, 0xb9, 0x52, 0x05, 0x02, 0x00, 0x00,
}

// Reference imports to suppress errors if they are not otherwise used.
var _ context.Context
var _ grpc.ClientConn

// This is a compile-time assertion to ensure that this generated file
// is compatible with the grpc package it is being compiled against.
const _ = grpc.SupportPackageIsVersion4

// FinancialCategoryServiceClient is the client API for FinancialCategoryService service.
//
// For semantics around ctx use and closing/ending streaming RPCs, please refer to https://godoc.org/google.golang.org/grpc#ClientConn.NewStream.
type FinancialCategoryServiceClient interface {
	GetFinancialCategories(ctx context.Context, in *Empty, opts ...grpc.CallOption) (*GetFinancialCategoriesResponse, error)
}

type financialCategoryServiceClient struct {
	cc *grpc.ClientConn
}

func NewFinancialCategoryServiceClient(cc *grpc.ClientConn) FinancialCategoryServiceClient {
	return &financialCategoryServiceClient{cc}
}

func (c *financialCategoryServiceClient) GetFinancialCategories(ctx context.Context, in *Empty, opts ...grpc.CallOption) (*GetFinancialCategoriesResponse, error) {
	out := new(GetFinancialCategoriesResponse)
	err := c.cc.Invoke(ctx, "/financialcategories.FinancialCategoryService/GetFinancialCategories", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

// FinancialCategoryServiceServer is the server API for FinancialCategoryService service.
type FinancialCategoryServiceServer interface {
	GetFinancialCategories(context.Context, *Empty) (*GetFinancialCategoriesResponse, error)
}

// UnimplementedFinancialCategoryServiceServer can be embedded to have forward compatible implementations.
type UnimplementedFinancialCategoryServiceServer struct {
}

func (*UnimplementedFinancialCategoryServiceServer) GetFinancialCategories(ctx context.Context, req *Empty) (*GetFinancialCategoriesResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "method GetFinancialCategories not implemented")
}

func RegisterFinancialCategoryServiceServer(s *grpc.Server, srv FinancialCategoryServiceServer) {
	s.RegisterService(&_FinancialCategoryService_serviceDesc, srv)
}

func _FinancialCategoryService_GetFinancialCategories_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(Empty)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(FinancialCategoryServiceServer).GetFinancialCategories(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/financialcategories.FinancialCategoryService/GetFinancialCategories",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(FinancialCategoryServiceServer).GetFinancialCategories(ctx, req.(*Empty))
	}
	return interceptor(ctx, in, info, handler)
}

var _FinancialCategoryService_serviceDesc = grpc.ServiceDesc{
	ServiceName: "financialcategories.FinancialCategoryService",
	HandlerType: (*FinancialCategoryServiceServer)(nil),
	Methods: []grpc.MethodDesc{
		{
			MethodName: "GetFinancialCategories",
			Handler:    _FinancialCategoryService_GetFinancialCategories_Handler,
		},
	},
	Streams:  []grpc.StreamDesc{},
	Metadata: "services/financialcategories/financialCategories.proto",
}
