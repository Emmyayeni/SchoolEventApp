# DEVELOPMENT OF A MOBILE-BASED APP INFORMATION SYSTEM FOR NSUK CAMPUS EVENTS

# CHAPTER FOUR
# SYSTEM IMPLEMENTATION AND TESTING

> **Draft status:** This document describes the NSUK Events implementation and verification recorded on 14 September 2026, at commit `f4bdffd`. Chapters One to Three and the department's prescribed report format were not available when this draft was prepared. The headings and wording of the objectives should therefore be reconciled with those chapters before submission. Screenshot positions and outstanding evaluation activities are explicitly identified below.

## 4.1 Introduction

This chapter presents the implementation and testing of NSUK Events, a mobile application developed to support the management and dissemination of campus event information at Nasarawa State University, Keffi. It explains how the application interface, authentication services, database and event-management functions work together. It also presents the available verification results and discusses the limits of those results.

The system targets Android and iOS devices. Its principal functions include account registration, event discovery, event publication, registration for events, bookmarking, announcements and administrative management. The implementation uses a shared mobile codebase connected to Supabase services. Although a browser preview is available during development, the intended user experience is that of an installed mobile application.

The evaluation reported in this chapter consists of automated application tests, local database migration tests, static code analysis, mobile bundle exports and a live database schema check. These activities provide evidence about specific aspects of implementation correctness. They do not constitute a completed usability study or demonstrate an increase in event attendance.

## 4.2 Implementation Environment

### 4.2.1 Software Tools

The principal implementation tools and their roles are presented in Table 4.1.

**Table 4.1: Software tools used in the implementation**

| Tool or technology | Role in the system |
| --- | --- |
| React Native | Construction of the mobile interface and reusable native interface components. |
| Expo SDK 54 | Mobile development workflow, platform configuration and integration with device features. |
| JavaScript | Application logic, validation, service calls and state management. |
| React Navigation | Movement between authentication, event, profile and administrative screens. |
| Supabase Auth | Authentication, session handling and password-recovery integration. |
| Supabase PostgreSQL | Persistent storage of application records and enforcement of database access rules. |
| Supabase Storage | Integration for profile images, event banners and announcement attachments. |
| Supabase Realtime | Subscription code for refreshing selected application data when database records change. |
| Expo Notifications | Integration for device push tokens and local event reminders. |
| Node.js test runner and PGlite | Automated application regression tests and isolated PostgreSQL migration tests. |
| ESLint | Static analysis of the source code. |
| Git and GitHub | Version control and storage of the project source. |

Development and the recorded checks were carried out in a Windows environment. Android and iOS JavaScript bundles were exported successfully. The record does not include a completed test on an identified physical device; consequently, device specifications and observed device performance are not reported as experimental results.

### 4.2.2 Configuration

The application obtains its Supabase configuration from local environment files. Environment files are excluded from version control. The mobile application uses the public project configuration, while authorization is enforced through authenticated sessions and database policies. Privileged database credentials must not be included in the mobile application bundle.

Platform configuration includes the application name, icons, portrait orientation and integration with image selection, notifications and date/time selection. Password-reset navigation uses an application URL scheme. Completion of the reset process must be verified using the installed application and the corresponding Supabase redirect configuration.

## 4.3 System Architecture

The implementation separates presentation, application state and data access. Screens and reusable components form the presentation layer. Context providers coordinate the authenticated user and event-related state. Service modules perform authentication, database, storage and notification operations.

When a user requests event information, the mobile interface calls the appropriate application service. The service sends the request to Supabase using the current session. Database access rules determine which records the account may access. Returned records are mapped into the format used by the interface. Loading, empty and error states communicate the outcome of the request.

This separation allows the same data-access functions to support several screens. For example, event information is used by the home feed, search results and event details. Reusable selection sheets provide a consistent way of choosing academic information and event options on a phone.

The application includes locally cached event and announcement data. Cached content can support continuity when previously retrieved information is available, but it may become outdated. The system does not provide a complete offline process for creating, approving or synchronizing all application records.

## 4.4 Database Implementation

### 4.4.1 Principal Tables

The database stores operational records separately from reference information used in selection controls. Table 4.2 summarises the main tables relevant to the implemented workflows.

**Table 4.2: Principal database tables and their purposes**

| Table | Purpose |
| --- | --- |
| `profiles` | Stores application profile information, account type, approval status and the device push-token field. |
| `admin_users` | Stores administrative role assignments. |
| `events` | Stores event descriptions, dates, start times, venues, organizers, audience, capacity and publication status. |
| `event_registrations` | Associates users with events and records registration or waitlist status. |
| `event_bookmarks` | Associates users with events they have saved. |
| `announcements` | Stores announcements, audience information and attachment references. |
| `notifications` | Stores notification records, read status and a source key used for deduplication. |
| `user_settings` | Stores user preference information. |
| `academic_faculties` | Supplies faculty choices. |
| `academic_departments` | Supplies department choices associated with a faculty. |
| `academic_levels` | Supplies academic-level choices. |
| `event_categories` | Supplies event-category choices. |

An event is associated with its creator, while registrations and bookmarks associate users with selected events. Separating these records allows event details, registration status and saved events to be retrieved according to the signed-in user's permissions.

### 4.4.2 Database-Driven Selection Controls

Faculty, department, academic level and event category are loaded from reference tables. Department choices are filtered using the selected faculty. When the faculty changes, the previous department selection is cleared to prevent an inconsistent combination.

Reference records differ from event activity records. A list of permitted academic levels defines available choices; it does not represent a measurement of student participation. Similarly, a category catalogue describes how events can be classified. The initial faculty and department catalogue was taken from the project's existing database baseline. Its completeness and institutional currency still require confirmation by the university.

If a catalogue query fails, the interface displays an error and offers a retry action. It does not replace the missing response with sample choices. If the database returns no choices, an empty state is displayed. These behaviours make configuration problems visible instead of presenting invented data as an operational result.

### 4.4.3 Access Control and Registration Totals

The database migrations implement account-approval restrictions and rules for permitted event operations. Ordinary profile edits are separated from changes to account authority. Event visibility depends on publication status, audience, ownership and administrative permissions.

Registration totals are obtained through a database function that returns aggregate counts for events the caller is permitted to see. This avoids treating the number of registration rows visible to an ordinary student as the total number of registrations for the event. Requests are divided into batches of at most 200 event identifiers. The aggregate response does not grant students access to other participants' identities.

These totals measure registrations, not confirmed physical attendance. The system has no verified attendance check-in process in the documented implementation. Reports and conclusions must therefore retain the distinction between an RSVP and attendance.

### 4.4.4 Migration and Live Verification

The account-approval and mobile-data migrations were packaged into one SQL file for the existing database. The migrations add the required columns, reference catalogues and registration-count function. They also clear the exact stock-photo URLs previously inserted as application defaults, while preserving other photo references and application records.

On 14 September 2026, the combined SQL was executed through the Supabase SQL Editor and success was reported. A subsequent read-only check confirmed that the expected tables, columns and registration-count function were available through the configured API. Local tests also verified rerunning the migrations and preserving the tested existing records.

The live check establishes schema availability. It does not, by itself, establish that all authenticated workflows, storage rules or notification integrations operate correctly on a phone.

## 4.5 Implementation of System Modules

### 4.5.1 Registration, Authentication and Profiles

The registration interface supports student, staff and organizer account types. Required information varies with the selected account type. Student registration includes academic details and a matriculation number, while staff registration includes a staff identifier. Input validation checks required fields, email format, password length and password confirmation before submission.

Authentication handling distinguishes a completed sign-in from registration that still requires email confirmation. Pending or disabled accounts are refused application access by the implemented account checks. Organizer registration is subject to the approval workflow. Session-handling logic also prevents an outdated sign-in response from restoring an account after sign-out.

The profile module allows users to edit their personal information and select an avatar. Academic information uses selection controls where appropriate, while organization names and role descriptions remain text fields. Where no usable profile photograph exists, initials provide a neutral representation of the actual user.

### 4.5.2 Event Discovery and Search

The home and search screens display event information retrieved from the database. Users can inspect event details and narrow results through keyword, category and date-based filtering. Date handling uses the campus calendar in Nigeria so that a device configured in another time zone does not silently change the intended event date.

Event details include the stored title, description, venue, date, time and relevant registration information. Missing photographs use a neutral image placeholder. Missing totals are treated as unavailable rather than automatically displayed as zero. Publication dates are derived from stored records rather than invented display values.

### 4.5.3 Event Creation and Management

Authorized organizers can enter and update event information. The form uses selection sheets for category, audience and status. Existing venue information is available for selection, with a text-entry option for a new venue. Native date and time controls support date/time entry, and capacity uses a numeric keyboard.

Validation rejects missing required information, impossible dates, invalid times and non-positive or fractional capacities. Saving an event as a draft persists the draft status in the database. The draft action remains subject to the implemented form validation; it should not be described as unrestricted saving of an incomplete form.

Owner and administrative functions support event management within the applicable permissions. Status information distinguishes published events from drafts, cancellations and other supported states. Since the schema does not store an event end time, the current display uses a two-hour duration estimate for timed event status. Calendar export retains a one-hour default duration. These defaults are implementation limitations rather than measured event lengths.

### 4.5.4 Event Registration, Waitlists and Bookmarks

Users can register for events and view their registration history. The application represents registered and waitlisted states separately. Capacity and registration rules determine the resulting registration state. Saved events provide a separate bookmarking function and do not imply that the user has registered.

A successful registration response updates the user's local registration state before refreshed data is requested. This prevents a subsequent refresh failure from being presented as if the registration itself had failed. Database totals remain the source of displayed aggregate registration information.

Participant-management screens support the event owner or an authorized administrator. Access to individual participant information is distinct from access to an aggregate registration count.

### 4.5.5 Announcements, Notifications and Reminders

The announcement module supports audience selection, attachments and viewing announcement details. Notification records include read status, and the application contains subscriptions for updating its inbox when relevant records change.

Server function code is provided for announcement and event notification webhooks. The webhook handlers check a configured shared secret, and draft events are excluded from event-publication announcements. The application also contains logic for scheduling local reminders 15 minutes before an event and reconciling reminders when refreshed event data changes.

The recorded tests cover selected handler and reminder behaviours. Deployment of the notification functions, webhook configuration, device permission prompts and receipt of an actual push notification were not verified in the recorded work. These functions are therefore described as implemented integrations requiring operational confirmation.

### 4.5.6 Administrative Functions

Administrative screens provide account management, approval actions, event moderation and registration-based reporting. Their purpose is to support authorized oversight of users and published event information.

Analytical values reflect records available to the account within the API's configured row limit. They must not be interpreted as complete institution-wide totals without confirming permission scope and retrieving all relevant records. Larger datasets require pagination.

## 4.6 Testing Procedure

Testing was conducted at several levels. Application regression tests exercised selected service functions, validation rules, date handling and session behaviour using controlled dependencies. Local database tests executed the SQL migrations in an isolated PostgreSQL environment. Static analysis examined source code, while mobile exports checked whether the application could be bundled for both target platforms. Finally, a read-only request checked the live database schema after migration.

Test fixtures were used only to create controlled conditions in the local tests. Fixture accounts, events and counts are not evidence of real student activity. No survey respondents, usability ratings, task-completion times or attendance measurements were generated by these checks.

### 4.6.1 Recorded Verification Results

**Table 4.3: Verification results recorded on 14 September 2026**

| Verification activity | Recorded result | Meaning and scope |
| --- | --- | --- |
| Automated test suite (`npm test`) | 33 tests passed; 0 failed. | The scenarios encoded in the suite passed under their controlled test conditions. |
| Static analysis (`npm run lint`) | Passed. | No lint failure was reported for the checked source. |
| Android export | Passed. | Android JavaScript/Hermes bundle generation completed. |
| iOS export | Passed. | iOS JavaScript/Hermes bundle generation completed. |
| Live schema check (`npm run check:backend`) | Passed after the migration. | Expected tables, columns and the count function were available through the API. |
| Physical-device acceptance testing | Not recorded. | Native interactions and complete signed-in workflows still require device evidence. |
| User evaluation | Not conducted in the recorded work. | No measured usability, awareness or participation outcome is available. |

Successful exports do not produce signed, installable APK or IPA release files and do not prove successful execution on every supported device. Likewise, passing tests is not a percentage measure of overall product quality or test coverage.

### 4.6.2 Functional Areas Covered by Automated Tests

**Table 4.4: Selected automated test coverage**

| Area | Tested behaviour |
| --- | --- |
| Database data mapping | Real registration totals and stored dates are retained without inventing images or publication dates. |
| Reference catalogues | Query failures are surfaced; department choices are filtered by faculty. |
| Event persistence | Draft and cancellation selections are included in database write payloads. |
| Date/time handling | Campus midnight, year boundaries, invalid dates and device time-zone differences are handled in the tested cases. |
| Input validation | Malformed login details, inconsistent signup information and invalid event capacities are rejected. |
| Account state | Pending and disabled accounts are refused; confirmation-required signup does not falsely establish an application session. |
| Profile authority | Ordinary profile updates preserve approval and administrative privileges in the tested service behaviour. |
| Session sequencing | A stale sign-in result does not override a later sign-out. |
| Database migration and permissions | Repeated migration execution, record preservation, aggregate-count visibility and anonymous catalogue-read restrictions are checked locally. |
| Notification handlers | Missing or invalid shared secrets and unsupported request methods are rejected; draft event announcements are excluded. |
| Local reminders | Reminder deduplication, event-time changes and logout cleanup are checked with controlled notification dependencies. |

### 4.6.3 Outstanding Acceptance Tests

The next evaluation stage should use an installed development build and separate student and approved organizer or administrator accounts. Each test should record the device, operating system, build identifier, date, expected result, observed result and supporting evidence.

**Table 4.5: Device acceptance tests awaiting recorded results**

| Test | Expected behaviour | Current evidence status |
| --- | --- | --- |
| Register, confirm email and sign in | The account follows its confirmation and approval requirements. | Phone test pending. |
| Approve an organizer and manage an event | Authorized actions succeed; unrelated accounts cannot modify the event. | Authenticated end-to-end test pending. |
| Use academic and event selectors | Choices load, departments follow the faculty, and the keyboard does not obstruct selection. | Phone test pending. |
| Register and join a full event's waitlist | Registration state and totals agree with stored records. | Multi-account phone test pending. |
| Save an event and restart the app | The bookmark remains associated with the correct account. | Phone test pending. |
| Upload a profile image or event banner | Permission and upload flows complete and the stored image is displayed. | Storage and device test pending. |
| Publish an audience-restricted announcement | Only permitted accounts can access the announcement. | Multi-account test pending. |
| Receive and open a push notification | The device receives the notification and opens the intended content. | Deployment and phone test pending. |
| Change an event time and refresh | The local reminder is reconciled with the updated event. | Phone test pending. |
| Sign out and switch accounts | Protected information and account-specific state do not leak into the next session. | Phone test pending. |

## 4.7 Discussion of Results

The available results support the conclusion that the implementation can be exported for Android and iOS and that the checked application behaviours satisfy their defined automated expectations. The database verification also confirms that the schema additions required by the mobile forms and count service are now available in the configured project.

A significant implementation improvement is the replacement of display-only sample information with database-derived records. Registration counts are obtained through an explicit aggregate query, academic choices come from reference tables, and unavailable images or values are represented honestly. This gives the interface a consistent relationship with stored information and makes missing configuration easier to diagnose.

The local access-control tests provide evidence that the count function differentiates between permitted and restricted event visibility in the tested roles. However, a complete assessment still requires live authenticated requests and device testing. The same distinction applies to notifications: passing a handler test does not demonstrate that a phone received a push message.

The system provides mechanisms intended to make campus events easier to discover and manage. Whether these mechanisms improve awareness, satisfaction or participation must be established through actual evaluation. The present evidence does not support numerical claims about those outcomes.

## 4.8 Interface Evidence to Include

The final report should include screenshots captured from the actual mobile application. Each image should have a caption explaining the visible function and should use consented or dedicated demonstration accounts. These are evidence positions, not completed figures:

1. **Figure 4.1:** Student registration with academic selection controls.
2. **Figure 4.2:** Home screen showing database event information.
3. **Figure 4.3:** Search and date/category filtering.
4. **Figure 4.4:** Event details showing registration status and available totals.
5. **Figure 4.5:** Organizer event form with native date/time and selection controls.
6. **Figure 4.6:** Registration history and saved events.
7. **Figure 4.7:** Account approval and event-management interface.
8. **Figure 4.8:** Announcement details and the notification inbox.

## 4.9 Chapter Summary

This chapter described the implemented mobile application, its database structure and the principal user and administrative workflows. It presented successful automated tests, static analysis, mobile exports and live schema verification. It also identified the device and user-evaluation evidence needed to complete the assessment.

# CHAPTER FIVE
# SUMMARY, CONCLUSION AND RECOMMENDATIONS

## 5.1 Introduction

This chapter summarises the implemented work and draws conclusions supported by the results presented in Chapter Four. It also identifies limitations and recommends the next steps for deployment, evaluation and further development.

## 5.2 Summary of the Work

The project produced NSUK Events, a mobile campus-event information system for Nasarawa State University, Keffi. The application brings event discovery, registration, bookmarking, announcements and authorized event administration into a shared interface for Android and iOS.

React Native and Expo were used for the application interface and mobile integration. Supabase provides authentication and a PostgreSQL database, with service integrations for storage and realtime updates. The implementation separates screens, shared application state and data services so that event and account information can be reused consistently across the application.

Database work addressed account approval, notification fields, academic and event reference catalogues, and controlled access to aggregate registration counts. Selection controls were introduced where users choose from defined values. Text fields remain for information such as names, descriptions and new venue details. Dummy display values and legacy default photo references were removed or replaced with neutral missing-data states.

Verification comprised 33 passing automated tests, successful lint checks, Android and iOS exports, and a successful live schema check after the database migrations were applied. These results establish a tested implementation baseline. They do not establish operational readiness for every native integration or demonstrate the effects of the application on the university community.

## 5.3 Principal Findings

### 5.3.1 Database Integration Supports Consistent Information

Event details, academic choices and registration totals are connected to stored records. This reduces reliance on separately maintained display values and supports consistency between event discovery, profile forms and management screens. The quality of the resulting information still depends on correct catalogue maintenance and accurate event entries.

### 5.3.2 Defined Choices Improve Input Consistency

Selection controls make permitted values visible to users. Faculty-linked department selection prevents the interface from retaining a department after its faculty has changed. Category, audience and status selection also support consistent event entry. These are implemented consistency measures; their effect on actual user error rates has not yet been measured.

### 5.3.3 Authorization Must Be Enforced Beyond the Interface

Different account types require different access to event and account information. The implementation combines interface behaviour with database restrictions and a visibility-aware aggregate function. Local SQL tests demonstrate selected access-control behaviours, while live multi-account testing remains necessary to verify the full deployed configuration.

### 5.3.4 Technical Verification and User Evaluation Are Distinct

The passing test suite and mobile exports provide evidence about the checked code and build process. They do not show whether students find events more quickly, whether organizers save time, or whether more people attend events. Those questions require observations and measurements from real users performing defined tasks.

## 5.4 Conclusion

The work has produced an implemented mobile prototype with database-connected event information, account management, registration workflows and administrative functions. The recorded verification supports the correctness of the tested behaviours and confirms the availability of the required live database schema.

The application provides a foundation for a centralized campus-event information service. Its current contribution is the implemented and partly verified functionality described in this report. Claims of improved awareness, increased participation, reduced administrative workload or successful institution-wide adoption remain to be evaluated through a controlled pilot and actual operational use.

## 5.5 Limitations

The principal limitations of the documented implementation and evaluation are as follows:

1. **Incomplete device evaluation:** Physical-device tests for permissions, uploads, notification receipt, password-reset links and full authenticated workflows have not been recorded.
2. **No user-study results:** The work contains no measured usability scores, participant feedback, task timings or attendance outcomes.
3. **Reference-data maintenance:** The initial faculty and department catalogue comes from the project baseline and requires institutional review for completeness and accuracy.
4. **Estimated event duration:** Event end times are not stored. Timed status labels use a two-hour estimate, while calendar export uses a one-hour default.
5. **Limited offline operation:** Cached records can be stale, and the application does not provide a complete offline write-and-synchronization workflow. Reminders may remain outdated until event information is refreshed.
6. **Unverified notification deployment:** Function deployment, webhook settings and push delivery need confirmation. Delivery receipt processing and automated retries are not implemented.
7. **Dataset-size constraints:** Lists and analytics need pagination to reliably handle records beyond the API row limit.
8. **Registration is not attendance:** RSVP data does not establish whether a registered user physically attended an event.

These limitations define the boundary of the present conclusions and help prioritize subsequent work.

## 5.6 Recommendations

### 5.6.1 Complete a Device-Based Pilot

A pilot should involve representative students, staff and event organizers using an installed build. Tasks should include account registration, finding an event, registering, saving an event and publishing an announcement where authorized. Record completion, errors, assistance required and participant comments. Include the device and network conditions so that observations can be interpreted accurately.

### 5.6.2 Confirm the Deployment Configuration

Before wider use, verify authenticated database policies, upload rules, password-reset redirects, realtime subscriptions and notification webhooks. Confirm the behaviour of student, organizer and administrative accounts separately. Test both permitted and prohibited actions rather than relying only on the visibility of interface buttons.

### 5.6.3 Assign Responsibility for Reference Data and Moderation

The university should identify personnel responsible for maintaining faculty, department, level and event-category information. A clear process should also govern organizer approval, event corrections and removal of inappropriate or outdated information. Maintaining the data is necessary for the application to remain useful after initial deployment.

### 5.6.4 Improve Event Timing and Notification Reliability

An explicit event end-time field should replace estimated durations and provide a consistent basis for status labels, calendar entries and reminders. Notification delivery should be strengthened with receipt handling, controlled retries and visible failure records. These improvements should be evaluated on devices under both reliable and interrupted network connections.

### 5.6.5 Prepare for Larger Datasets

Pagination should be added to event, registration and administrative queries before drawing conclusions from large datasets. Performance should then be measured under defined data volumes and network conditions. Complete data retrieval is especially important when generating administrative totals.

## 5.7 Suggestions for Further Work

Further development could add a validated attendance check-in process, richer event scheduling, accessibility improvements and more complete offline synchronization. Each addition should be tied to a confirmed institutional requirement and evaluated separately.

A subsequent study could assess whether the application improves event discovery or organizer efficiency. Such a study should specify participant recruitment, consent, tasks and evaluation measures before collecting data. Any comparison with an existing communication process should describe that process using collected evidence. Findings should be reported from the resulting observations rather than inferred from feature availability.

## 5.8 Contribution of the Project

The project's practical contribution is a mobile implementation that connects campus-event workflows to a shared database and applies account-sensitive access to information and management functions. A further technical contribution is the accompanying set of repeatable regression and migration checks, which provides a basis for identifying faults as the application changes.

These contributions support continued development and evaluation. Their institutional value should be assessed through actual use, accurate information maintenance and documented feedback from the intended users.

---

## Working Notes for Finalising the Report

This section is an editorial checklist and should be removed from the submitted chapters after the items are resolved.

- Align the chapter titles, objectives and terminology with the approved Chapters One to Three and departmental format.
- Insert genuine phone screenshots at the positions in Section 4.8 and update the figure references.
- Complete Table 4.5 using observed results, including failures, device details and the tested build.
- Add user-evaluation findings only after the evaluation has been conducted; report the actual sample and method.
- Reconcile all implementation claims with the version demonstrated at the defence.
- Apply the institution's required page layout, table style and referencing format. This draft uses project evidence and does not introduce an external literature review.

### Internal Evidence Used for This Draft

- `README.md`: project scope, architecture and verification commands.
- `docs/PROJECT_COMPLETION.md`: implementation mapping, deployment status and outstanding acceptance checks.
- `docs/MOBILE_DATABASE_SETUP.md`: migration procedure, reference-data provenance and live schema verification.
- `src/utils/validation.js`, `src/utils/eventTime.js` and relevant screen/service modules: implemented validation, date handling and data flows.
- `tests/core.test.cjs`, `tests/migrations.test.cjs` and `tests/webhooks.test.cjs`: encoded regression scenarios.
- Recorded verification of commit `f4bdffd` on 14 September 2026: 33 tests passed, lint passed, Android/iOS exports passed, and the post-migration live schema check passed.
