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

  // Notice types
  // OLD Notice type (without imageId) - kept for stable variable compatibility on upgrade
  type NoticeV1 = {
    title : Text;
    content : Text;
    isImportant : Bool;
    createdAt : Time.Time;
  };

  // NEW Notice type (with imageId)
  type NoticeV2 = {
    title : Text;
    content : Text;
    isImportant : Bool;
    imageId : ?Text;
    createdAt : Time.Time;
  };

  func compareNotices(n1 : NoticeV2, n2 : NoticeV2) : Order.Order {
    switch (Int.compare(n2.createdAt, n1.createdAt)) {
      case (#equal) { Text.compare(n1.title, n2.title) };
      case (order) { order };
    };
  };

  module News {
    public type News = {
      title : Text;
      content : Text;
      imageId : ?Text;
      isBreaking : Bool;
      createdAt : Time.Time;
    };

    public func compare(news1 : News, news2 : News) : Order.Order {
      switch (Int.compare(news2.createdAt, news1.createdAt)) {
        case (#equal) { Text.compare(news1.title, news2.title) };
        case (order) { order };
      };
    };
  };

  public type Complaint = Complaint.Complaint;
  public type Notice = NoticeV2;
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

  // Keep the original `notices` variable with the OLD type (NoticeV1) for stable upgrade compatibility.
  // This preserves existing data. On first run after upgrade, data is migrated to notices2.
  let notices = Map.empty<Text, NoticeV1>();

  // New notices map supporting imageId
  let notices2 = Map.empty<Text, NoticeV2>();

  let newsItems = Map.empty<Text, News.News>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var complaintCounter = 0;
  var newsCounter = 0;
  transient var noticesMigrated = false;

  // On each startup, migrate any remaining old notices (v1) into notices2
  if (not noticesMigrated) {
    for ((id, old) in notices.entries()) {
      if (not notices2.containsKey(id)) {
        notices2.add(id, {
          title = old.title;
          content = old.content;
          isImportant = old.isImportant;
          imageId = null;
          createdAt = old.createdAt;
        });
      };
    };
    notices.clear();
    noticesMigrated := true;
  };

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
    imageId : ?Text;
  };

  public type NewsInput = {
    title : Text;
    content : Text;
    imageId : ?Text;
    isBreaking : Bool;
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

  // PUBLIC stats - no auth required
  public query func getComplaintStats() : async ComplaintStats {
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

    { total; pending; resolved; urgent };
  };

  // Notice Board Management
  public shared ({ caller }) func addNotice(input : NoticeInput) : async Text {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let noticeId = Time.now().toText();
    let notice : NoticeV2 = {
      title = input.title;
      content = input.content;
      isImportant = input.isImportant;
      imageId = input.imageId;
      createdAt = Time.now();
    };
    notices2.add(noticeId, notice);
    noticeId;
  };

  public query func getNotices() : async [NoticeV2] {
    notices2.values().toArray().sort(compareNotices);
  };

  public shared ({ caller }) func deleteNotice(noticeId : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (not notices2.containsKey(noticeId)) {
      Runtime.trap("Notice not found");
    };
    notices2.remove(noticeId);
  };

  // News/Updates Management
  public shared ({ caller }) func addNews(input : NewsInput) : async Text {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    newsCounter += 1;
    let newsId = "NEWS" # newsCounter.toText() # "_" # Time.now().toText();
    let news : News.News = {
      title = input.title;
      content = input.content;
      imageId = input.imageId;
      isBreaking = input.isBreaking;
      createdAt = Time.now();
    };
    newsItems.add(newsId, news);
    newsId;
  };

  public query func getNews() : async [News.News] {
    newsItems.values().toArray().sort();
  };

  public shared ({ caller }) func deleteNews(newsId : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (not newsItems.containsKey(newsId)) {
      Runtime.trap("News not found");
    };
    newsItems.remove(newsId);
  };
};
