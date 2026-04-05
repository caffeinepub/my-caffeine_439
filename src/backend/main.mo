import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Int "mo:core/Int";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";



actor {
  include MixinStorage();

  module Complaint {
    public func compare(complaint1 : Complaint, complaint2 : Complaint) : Order.Order {
      Text.compare(complaint1.complaintNumber, complaint2.complaintNumber);
    };

    public type Status = {
      #pending;
      #underReview;
      #investigating;
      #resolved;
      #rejected;
    };

    public type Priority = {
      #normal;
      #urgent;
      #veryUrgent;
    };

    public type Complaint = {
      complainantName : Text;
      workerId : ?Text;
      mobile : Text;
      companyName : Text;
      workAddress : Text;
      complaintType : Text;
      subject : Text;
      details : Text;
      incidentDate : Text;
      priority : Priority;
      attachmentIds : [Text];
      complaintNumber : Text;
      status : Status;
      statusDescription : ?Text;
      officer : ?Text;
      department : ?Text;
      officerRemarks : ?Text;
      nextStep : ?Text;
      createdAt : Time.Time;
      updatedAt : Time.Time;
    };
  };

  module Notice {
    public type Notice = {
      title : Text;
      content : Text;
      isImportant : Bool;
      createdAt : Time.Time;
    };

    public func compare(notice1 : Notice, notice2 : Notice) : Order.Order {
      switch (Int.compare(notice2.createdAt, notice1.createdAt)) {
        case (#equal) { Text.compare(notice1.title, notice2.title) };
        case (order) { order };
      };
    };
  };

  public type Complaint = Complaint.Complaint;
  public type ComplaintStats = {
    total : Nat;
    pending : Nat;
    resolved : Nat;
    urgent : Nat;
  };

  public type UserProfile = {
    name : Text;
  };

  let complaints = Map.empty<Text, Complaint>();
  let notices = Map.empty<Text, Notice.Notice>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var complaintCounter = 0;

  public type ComplaintInput = {
    complainantName : Text;
    workerId : ?Text;
    mobile : Text;
    companyName : Text;
    workAddress : Text;
    complaintType : Text;
    subject : Text;
    details : Text;
    incidentDate : Text;
    priority : Complaint.Priority;
    attachmentIds : [Text];
  };

  public type ComplaintEditInput = {
    complainantName : Text;
    workerId : ?Text;
    mobile : Text;
    companyName : Text;
    workAddress : Text;
    complaintType : Text;
    subject : Text;
    details : Text;
    incidentDate : Text;
    priority : Complaint.Priority;
    status : Complaint.Status;
    statusDescription : ?Text;
    officer : ?Text;
    department : ?Text;
    officerRemarks : ?Text;
    nextStep : ?Text;
  };

  public type NoticeInput = {
    title : Text;
    content : Text;
    isImportant : Bool;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  func pad4(n : Nat) : Text {
    let s = n.toText();
    if (s.size() >= 4) { s }
    else if (s.size() == 3) { "0" # s }
    else if (s.size() == 2) { "00" # s }
    else { "000" # s };
  };

  func generateComplaintNumber() : Text {
    complaintCounter += 1;
    "BGWS" # pad4(complaintCounter);
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Complaint Management
  public shared ({ caller }) func submitComplaint(input : ComplaintInput) : async Text {
    // Allow any caller including guests to submit complaints
    let complaintNumber = generateComplaintNumber();
    let now = Time.now();
    let complaint : Complaint = {
      input with
      complaintNumber;
      status = #pending;
      statusDescription = null;
      createdAt = now;
      updatedAt = now;
      officer = null;
      department = null;
      officerRemarks = null;
      nextStep = null;
    };
    complaints.add(complaintNumber, complaint);
    complaintNumber;
  };

  public query ({ caller }) func getComplaintByNumber(complaintNumber : Text) : async Complaint {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view complaint details");
    };
    switch (complaints.get(complaintNumber)) {
      case (null) { Runtime.trap("Complaint not found") };
      case (?complaint) { complaint };
    };
  };

  public query ({ caller }) func getAllComplaints() : async [Complaint] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    complaints.values().toArray().sort();
  };

  public shared ({ caller }) func updateComplaintStatus(complaintNumber : Text, newStatus : Complaint.Status) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let complaint = switch (complaints.get(complaintNumber)) {
      case (null) { Runtime.trap("Complaint not found") };
      case (?c) { c };
    };

    let updatedComplaint : Complaint = {
      complaint with
      status = newStatus;
      updatedAt = Time.now();
    };
    complaints.add(complaintNumber, updatedComplaint);
  };

  public shared ({ caller }) func updateComplaintStatusWithDescription(complaintNumber : Text, newStatus : Complaint.Status, description : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let complaint = switch (complaints.get(complaintNumber)) {
      case (null) { Runtime.trap("Complaint not found") };
      case (?c) { c };
    };

    let updatedComplaint : Complaint = {
      complaint with
      status = newStatus;
      statusDescription = if (description == "") { null } else { ?description };
      updatedAt = Time.now();
    };
    complaints.add(complaintNumber, updatedComplaint);
  };

  public shared ({ caller }) func updateComplaint(complaintNumber : Text, input : ComplaintEditInput) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let complaint = switch (complaints.get(complaintNumber)) {
      case (null) { Runtime.trap("Complaint not found") };
      case (?c) { c };
    };
    let updatedComplaint : Complaint = {
      complaint with
      complainantName = input.complainantName;
      workerId = input.workerId;
      mobile = input.mobile;
      companyName = input.companyName;
      workAddress = input.workAddress;
      complaintType = input.complaintType;
      subject = input.subject;
      details = input.details;
      incidentDate = input.incidentDate;
      priority = input.priority;
      status = input.status;
      statusDescription = input.statusDescription;
      officer = input.officer;
      department = input.department;
      officerRemarks = input.officerRemarks;
      nextStep = input.nextStep;
      updatedAt = Time.now();
    };
    complaints.add(complaintNumber, updatedComplaint);
  };

  public shared ({ caller }) func assignOfficer(complaintNumber : Text, officer : Text, department : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let complaint = switch (complaints.get(complaintNumber)) {
      case (null) { Runtime.trap("Complaint not found") };
      case (?c) { c };
    };
    let updatedComplaint : Complaint = {
      complaint with
      officer = ?officer;
      department = ?department;
      updatedAt = Time.now();
    };
    complaints.add(complaintNumber, updatedComplaint);
  };

  public shared ({ caller }) func addOfficerRemarks(complaintNumber : Text, remarks : Text, nextStep : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let complaint = switch (complaints.get(complaintNumber)) {
      case (null) { Runtime.trap("Complaint not found") };
      case (?c) { c };
    };
    let updatedComplaint : Complaint = {
      complaint with
      officerRemarks = ?remarks;
      nextStep = ?nextStep;
      updatedAt = Time.now();
    };
    complaints.add(complaintNumber, updatedComplaint);
  };

  public query ({ caller }) func getComplaintStats() : async ComplaintStats {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view complaint statistics");
    };
    var total = 0;
    var pending = 0;
    var resolved = 0;
    var urgent = 0;

    for (complaint in complaints.values()) {
      total += 1;
      switch (complaint.status) {
        case (#pending) { pending += 1 };
        case (#resolved) { resolved += 1 };
        case (_) {};
      };
      switch (complaint.priority) {
        case (#urgent) { urgent += 1 };
        case (#veryUrgent) { urgent += 1 };
        case (_) {};
      };
    };

    {
      total;
      pending;
      resolved;
      urgent;
    };
  };

  // Notice Board Management
  public shared ({ caller }) func addNotice(input : NoticeInput) : async Text {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let noticeId = Time.now().toText();
    let notice : Notice.Notice = {
      input with
      createdAt = Time.now();
    };
    notices.add(noticeId, notice);
    noticeId;
  };

  public query ({ caller }) func getNotices() : async [Notice.Notice] {
    // Public notices are viewable by everyone including guests
    notices.values().toArray().sort();
  };

  public shared ({ caller }) func deleteNotice(noticeId : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (not notices.containsKey(noticeId)) {
      Runtime.trap("Notice not found");
    };
    notices.remove(noticeId);
  };
};
