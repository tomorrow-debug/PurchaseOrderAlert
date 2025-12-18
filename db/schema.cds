namespace scp.cloud;

using {
  managed,
  cuid,
  sap.common
} from '@sap/cds/common';

type Url : String;

type TechnicalBooleanFlag : Boolean @(
    UI.Hidden,
    Core.Computed
);

type TechnicalFieldControlFlag : Integer @(
    UI.Hidden,
    Core.Computed
);

type Criticality : Integer @(
    UI.Hidden,
    Core.Computed
);

type Identifier : String(100)@(title : 'Identifier');
@cds.autoexpose
aspect identified : cuid {
    identifier : Identifier not null;
}

//Bolded display of first table column values can be achieved by defining annotations Common.SemanticKey and
//Common.TextArrangment for the entities key and referring to a 'human-readable' identifier to be displayed instead.

annotate identified with @(
    Common.SemanticKey : [identifier],
    UI.Identification  : [{Value : identifier}]
) {

    ID         @Common : {
        Text            : identifier,
        TextArrangement : #TextOnly
        
    };
}

// Code List entities must be defined first
entity PurchaseCodeList : common.CodeList {
  key code : String(20);
}

entity OrderUnit : PurchaseCodeList {}

entity Currency : PurchaseCodeList {}

entity Priority : PurchaseCodeList {
  criticality : Integer not null default 3;
}

entity RequestStatus : PurchaseCodeList {}

entity Supplier : managed {
  key ID            : String(20);
      name          : String(100)  @title : 'Supplier Name';
      contactPerson : String(100)  @title : 'Contact Person';
      email         : String(100)  @title : 'Email';
      phone         : String(50)   @title : 'Phone';
}

entity Individual : managed{
  Key ID                : UUID;
      fullName          : String    @title : 'Full Name';
      emailAddress      : String    @title : 'Email Address';
}

entity PurchaseFlow : managed {
  key id                : String;
      processStep       : String(30)@title : 'Process Step';
      stepStatus        : String(10)@title : 'Step Status';
      criticality       : Integer;
      stepStartDate     : Date      @title : 'Step Start Date';
      stepEndDate       : Date      @title : 'Step End Date';
      @assert.integrity : false
      purchaseRequest   : Association to PurchaseRequests;
}

entity PurchaseProcessTimeline : managed {
  key id                : String;
      text              : String;
      type              : String;
      startTime         : DateTime;
      endTime           : DateTime;
      @assert.integrity : false
      purchaseRequest   : Association to PurchaseRequests;
}

entity PurchaseRequests : managed, identified {
  purchaseOrder           : String(50)                        @title : 'Purchase Order';
  project                 : String(20)                        @title : 'Project';
  material                : String(50)                        @title : 'Material';
  shortText               : String(100)                       @title : 'Short Text';
  purchaseQuantity        : Integer                           @title : 'Purchase Quantity';
  orderUnit               : Association to one OrderUnit      @title : 'Order Unit';
  deliveryDate            : Date                              @title : 'Delivery Date';
  requestDate             : Date                              @title : 'Request Date';
  modifyDate              : Date                              @title : '修改日期';
  orderDate               : Date                              @title : '下单日期';
  approvalDate            : Date                              @title : 'Approval Date';
  currency                : Association to one Currency       @title : 'Currency';
  price                   : Decimal(15,2)                     @title : 'Price';
  priceUnit               : Integer                           @title : 'Per';
  unit                    : String(10)                        @title : 'Unit';
  totalValue              : Decimal(15,2)                     @title : 'Total Value';
  frameworkAgreement      : String(50)                        @title : 'Framework Agreement';
  supplier                : Association to one Supplier       @title : 'Designated Supplier';
  purchasingOrganization  : String(100)                       @title : 'Purchasing Organization';
  purchasingGroup         : String(20)                        @title : 'Purchasing Group';
  deliveryAddress         : String(200)                       @title : 'Delivery Address';
  contactPerson           : Association to one Individual     @title : 'Contact Person';
  requestStatus           : Association to one RequestStatus  @title : 'Request Status';
  priority                : Association to one Priority       @title : 'Priority';
  purchaseFlow            : Association to many PurchaseFlow
                              on purchaseFlow.purchaseRequest = $self;
  purchaseProcessTimeline : Association to many PurchaseProcessTimeline
                              on purchaseProcessTimeline.purchaseRequest = $self;
  aiSummary               : String(200)                       @title : 'AI Summary';
  isDraft                 : TechnicalBooleanFlag not null default false;
  identifierFieldControl  : TechnicalFieldControlFlag not null default 7; // 7 = #Mandatory;
}
