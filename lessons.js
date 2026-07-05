// CCNA Daily — 60-day CCNA 200-301 curriculum
// Schema: id, d(omain), t(itle), min(utes), c(ontent paras), k(ey points), cmd(optional CLI), q(uiz)

const DOMAINS = {
  fund: { name: "Network Fundamentals", short: "FUND", iface: "Gi0/1", pct: 20 },
  acc:  { name: "Network Access", short: "ACCESS", iface: "Gi0/2", pct: 20 },
  ip:   { name: "IP Connectivity", short: "IP CONN", iface: "Gi0/3", pct: 25 },
  svc:  { name: "IP Services", short: "SERVICES", iface: "Gi0/4", pct: 10 },
  sec:  { name: "Security Fundamentals", short: "SECURITY", iface: "Gi0/5", pct: 15 },
  auto: { name: "Automation & Programmability", short: "AUTO", iface: "Gi0/6", pct: 10 }
};

const LESSONS = [
{ id: 1, d: "fund", t: "The OSI Model", min: 5,
  c: [
    "Everything on this exam hangs off the OSI model, so day one is locking it in. Seven layers, bottom to top: **Physical, Data Link, Network, Transport, Session, Presentation, Application**. Mnemonic: Please Do Not Throw Sausage Pizza Away.",
    "Each layer has a job and a PDU (protocol data unit). L1 moves **bits** over cable or RF. L2 builds **frames** with MAC addresses. L3 routes **packets** with IP addresses. L4 delivers **segments** with port numbers. L5-L7 handle sessions, formatting/encryption, and the app-facing protocols like HTTP.",
    "When you troubleshoot at the desk you already think this way: cable unplugged is L1, wrong VLAN is L2, bad gateway is L3, blocked port is L4."
  ],
  k: [
    "L1 bits, L2 frames (MAC), L3 packets (IP), L4 segments (ports)",
    "Switches live at L2, routers at L3, firewalls often L3-L4+",
    "Encapsulation adds headers going down; de-encapsulation strips them going up",
    "Exam loves matching device or address type to a layer"
  ],
  q: [
    { q: "A switch makes forwarding decisions based on which OSI layer?", o: ["Layer 1", "Layer 2", "Layer 3", "Layer 4"], a: 1, e: "Switches forward frames using MAC addresses — Layer 2." },
    { q: "What is the PDU at the Transport layer?", o: ["Frame", "Packet", "Segment", "Bit"], a: 2, e: "L4 = segments. Frame is L2, packet is L3, bits are L1." },
    { q: "Which layer is responsible for logical addressing and routing?", o: ["Data Link", "Network", "Session", "Physical"], a: 1, e: "Layer 3 (Network) uses IP addresses to route between networks." }
  ]
},
{ id: 2, d: "fund", t: "TCP/IP Model & Encapsulation", min: 5,
  c: [
    "The TCP/IP model is what real networks actually run. Four layers: **Link (Network Access), Internet, Transport, Application**. It maps to OSI like this: Link = L1+L2, Internet = L3, Transport = L4, Application = L5-L7.",
    "Encapsulation is the process: your app data gets a TCP/UDP header (now a segment), then an IP header (packet), then an Ethernet header **and trailer** (frame), then hits the wire as bits. The frame is the only PDU with a trailer — the FCS checksum.",
    "De-encapsulation is the reverse at the receiver. A router strips the frame, reads the IP header, then builds a **new frame** for the next hop — L2 gets rewritten every hop, L3 addresses stay the same end to end."
  ],
  k: [
    "TCP/IP layers: Link, Internet, Transport, Application",
    "Data → segment → packet → frame → bits",
    "Frames have a header AND a trailer (FCS)",
    "Routers rewrite L2 (MACs) each hop; source/dest IPs are unchanged end to end"
  ],
  q: [
    { q: "As a packet crosses three routers, what happens to the source MAC address?", o: ["Stays the same end to end", "Changes at every hop", "Only changes at the last router", "MACs are removed by routers"], a: 1, e: "Each router builds a new frame, so L2 addresses change every hop." },
    { q: "Which PDU includes a trailer?", o: ["Segment", "Packet", "Frame", "Bit"], a: 2, e: "The Ethernet frame carries the FCS in a trailer." },
    { q: "The Internet layer of TCP/IP maps to which OSI layer?", o: ["Layer 2", "Layer 3", "Layer 4", "Layer 7"], a: 1, e: "Internet layer = OSI Network layer (L3), where IP lives." }
  ]
},
{ id: 3, d: "fund", t: "TCP vs UDP", min: 6,
  c: [
    "**TCP** is connection-oriented and reliable. It starts with the three-way handshake: **SYN → SYN-ACK → ACK**. Sequence and acknowledgment numbers track every byte, lost segments get retransmitted, and the **window size** provides flow control (receiver tells sender how much it can take). Teardown uses FIN/ACK exchanges.",
    "**UDP** is connectionless, best-effort, and fast. Its header is only 8 bytes — ports, length, checksum — no sequencing, no acks, no flow control. The application deals with any loss.",
    "Rule of thumb: TCP for anything that must arrive complete (web, email, file transfer). UDP for anything where speed beats perfection or the app handles reliability itself (voice/video, DNS queries, DHCP, TFTP)."
  ],
  k: [
    "Handshake: SYN, SYN-ACK, ACK — memorize the order",
    "TCP: reliable, ordered, flow control via window size",
    "UDP: 8-byte header, no handshake, no retransmission",
    "VoIP uses UDP — retransmitted voice would arrive too late to matter"
  ],
  q: [
    { q: "What is the correct TCP three-way handshake order?", o: ["ACK, SYN, SYN-ACK", "SYN, ACK, SYN-ACK", "SYN, SYN-ACK, ACK", "SYN-ACK, SYN, ACK"], a: 2, e: "Client SYN, server SYN-ACK, client ACK." },
    { q: "Which TCP field provides flow control?", o: ["Sequence number", "Window size", "Checksum", "Urgent pointer"], a: 1, e: "The receiver advertises a window size to throttle the sender." },
    { q: "Why does VoIP traffic use UDP?", o: ["UDP encrypts audio", "UDP guarantees delivery", "Low overhead and no retransmission delay", "TCP cannot carry audio"], a: 2, e: "Real-time audio values speed; late retransmissions are useless." }
  ]
},
{ id: 4, d: "fund", t: "Port Numbers You Must Know", min: 6,
  c: [
    "Well-known ports (0-1023) identify the service inside the Transport header. These show up constantly on the exam and in ACL questions later, so drill them cold.",
    "**TCP:** FTP 20/21 · SSH 22 · Telnet 23 · SMTP 25 · HTTP 80 · POP3 110 · IMAP 143 · HTTPS 443. **UDP:** DHCP 67/68 · TFTP 69 · NTP 123 · SNMP 161/162 · Syslog 514. **Both:** DNS 53 (UDP for queries, TCP for zone transfers).",
    "Registered ports run 1024-49151; dynamic/ephemeral 49152-65535 are what your client grabs as a source port when it opens a connection."
  ],
  k: [
    "SSH 22 replaces Telnet 23 — you configure this later in Services",
    "DHCP: server listens on 67, client on 68",
    "DNS 53 is the classic 'both TCP and UDP' answer",
    "SNMP agent 161, traps to manager on 162"
  ],
  q: [
    { q: "Which port does SSH use?", o: ["21", "22", "23", "25"], a: 1, e: "SSH = TCP 22. Telnet is 23, FTP control is 21, SMTP is 25." },
    { q: "A DHCP server listens on which UDP port?", o: ["53", "67", "68", "69"], a: 1, e: "Server 67, client 68. TFTP is 69, DNS is 53." },
    { q: "Which protocol commonly uses both TCP and UDP port 53?", o: ["DHCP", "SNMP", "DNS", "NTP"], a: 2, e: "DNS queries ride UDP 53; zone transfers use TCP 53." }
  ]
},
{ id: 5, d: "fund", t: "Ethernet, MACs & How a Switch Thinks", min: 6,
  c: [
    "A MAC address is 48 bits, written as 12 hex digits (like `a4:83:e7:2c:10:5f`). First half is the OUI (vendor), second half is unique. Burned in, Layer 2, only significant on the local segment.",
    "A switch builds its **MAC address table by reading SOURCE MACs** on incoming frames and recording the port they arrived on. Forwarding decisions then use the **destination** MAC with three outcomes: **forward** (dest known, out that port), **flood** (dest unknown, broadcast, or multicast — out all ports except the one it came in), or **filter** (dest lives on the same port it arrived on — drop).",
    "Entries age out (default 300 seconds on Cisco). Broadcast MAC is `ffff.ffff.ffff` and is always flooded — that is why one broadcast domain = one VLAN."
  ],
  k: [
    "Learn on SOURCE MAC, forward on DESTINATION MAC",
    "Unknown unicast gets flooded, not dropped",
    "Each switch port is its own collision domain; a VLAN is one broadcast domain",
    "`show mac address-table` is your friend at the desk and on the exam"
  ],
  cmd: ["show mac address-table", "show mac address-table dynamic interface g0/1"],
  q: [
    { q: "How does a switch populate its MAC address table?", o: ["From destination MACs", "From source MACs of received frames", "From ARP replies only", "Manually only"], a: 1, e: "It learns the source MAC and maps it to the ingress port." },
    { q: "A frame arrives for a destination MAC not in the table. The switch will:", o: ["Drop it", "Send it to the default gateway", "Flood it out all other ports", "Buffer it until learned"], a: 2, e: "Unknown unicast frames are flooded everywhere except the ingress port." },
    { q: "How many bits are in a MAC address?", o: ["32", "48", "64", "128"], a: 1, e: "48 bits = 12 hex characters. IPv4 is 32, IPv6 is 128." }
  ]
},
{ id: 6, d: "fund", t: "IPv4 Addressing, Classes & Private Ranges", min: 6,
  c: [
    "IPv4 = 32 bits, four octets, each 0-255. Every address splits into a **network portion** and a **host portion**, and the subnet mask is what marks the split.",
    "Legacy classes (still tested): **A** 1-126 (/8), **B** 128-191 (/16), **C** 192-223 (/24), **D** 224-239 multicast, **E** 240-255 experimental. 127.0.0.0/8 is loopback.",
    "**RFC 1918 private ranges** — burn these in: `10.0.0.0/8`, `172.16.0.0/12` (172.16-172.31), `192.168.0.0/16`. Not routable on the internet; NAT translates them (lesson 40). **APIPA** `169.254.0.0/16` means a host asked DHCP and nobody answered — you have seen that one on tickets."
  ],
  k: [
    "Class B starts at 128, Class C at 192 — the exam tests the boundaries",
    "172.16.0.0/12 covers 172.16.x.x through 172.31.x.x only",
    "169.254.x.x = APIPA = DHCP failure symptom",
    "127.x.x.x is loopback, not usable on hosts' networks"
  ],
  q: [
    { q: "Which address is NOT in a private RFC 1918 range?", o: ["10.44.2.9", "172.20.1.5", "172.33.1.5", "192.168.254.7"], a: 2, e: "Private 172 space stops at 172.31.255.255 — 172.33 is public." },
    { q: "A workstation shows 169.254.10.20. What happened?", o: ["Static misconfig to loopback", "It received a public lease", "DHCP failed and APIPA self-assigned", "DNS is down"], a: 2, e: "APIPA (169.254/16) means no DHCP server responded." },
    { q: "192.5.1.1 belongs to which class?", o: ["Class A", "Class B", "Class C", "Class D"], a: 2, e: "192-223 in the first octet = Class C." }
  ]
},
{ id: 7, d: "fund", t: "Subnetting I: Masks & the Magic Number", min: 8,
  c: [
    "A mask like /26 means 26 network bits, 6 host bits. Hosts per subnet = **2^host_bits − 2** (network and broadcast are reserved). /26 → 2^6 − 2 = **62 hosts**.",
    "Fast method — the **magic number**: 256 minus the interesting (non-255/0) mask octet. /26 = 255.255.255.**192** → magic = 256−192 = **64**. Subnets step by 64: .0, .64, .128, .192. Your address falls in one block; block start = network ID, block end minus... the last address = broadcast.",
    "Worked example: `192.168.1.100/26`. Blocks of 64 → 100 lands in the 64-127 block. Network `192.168.1.64`, broadcast `192.168.1.127`, usable `.65 - .126`."
  ],
  k: [
    "Mask values to know: 128, 192, 224, 240, 248, 252, 254, 255",
    "Magic number = 256 − interesting octet; subnets increment by it",
    "First address = network ID, last = broadcast, everything between is usable",
    "/30 gives 2 usable hosts — classic for point-to-point links"
  ],
  q: [
    { q: "How many usable hosts in a /26?", o: ["30", "62", "64", "126"], a: 1, e: "6 host bits: 2^6 − 2 = 62." },
    { q: "What is the network address of 10.1.1.75/27?", o: ["10.1.1.0", "10.1.1.64", "10.1.1.72", "10.1.1.96"], a: 1, e: "/27 magic = 32; 75 falls in the 64-95 block → network 10.1.1.64." },
    { q: "The broadcast address of 172.16.4.0/23 is:", o: ["172.16.4.255", "172.16.5.255", "172.16.7.255", "172.16.4.254"], a: 1, e: "/23 spans two third-octet values: 4.0-5.255, so broadcast is 172.16.5.255." }
  ]
},
{ id: 8, d: "fund", t: "Subnetting II: CIDR Practice & Design", min: 8,
  c: [
    "Design questions flip it around: **how many subnets or hosts do I need?** Borrowing bits: each borrowed bit doubles subnets and halves host space. Need 5 subnets from a /24? Borrow 3 bits (2^3 = 8 ≥ 5) → /27, 30 hosts each.",
    "Need at least 100 hosts? Find host bits where 2^n − 2 ≥ 100 → n = 7 → **/25** (126 hosts). Need 500? n = 9 → **/23** (510).",
    "Speed drill for the exam: memorize /24 = 254, /25 = 126, /26 = 62, /27 = 30, /28 = 14, /29 = 6, /30 = 2. And going bigger: /23 = 510, /22 = 1022, /21 = 2046. You will answer these in under 20 seconds with the table in your head."
  ],
  k: [
    "Each borrowed bit: subnets ×2, hosts roughly ÷2",
    "2^n − 2 ≥ required hosts → pick n host bits",
    "/25=126, /26=62, /27=30, /28=14, /29=6, /30=2 — memorize",
    "A /22 covers four /24s (1022 hosts)"
  ],
  q: [
    { q: "You need 6 subnets from 192.168.10.0/24, maximizing hosts. Which mask?", o: ["/25", "/26", "/27", "/28"], a: 2, e: "Borrow 3 bits (8 subnets ≥ 6) → /27 with 30 hosts each." },
    { q: "Smallest subnet that supports 300 hosts?", o: ["/22", "/23", "/24", "/25"], a: 1, e: "/23 gives 510 usable; /24 only 254." },
    { q: "How many /28 subnets fit inside one /24?", o: ["4", "8", "16", "32"], a: 2, e: "4 borrowed bits → 2^4 = 16 subnets of 14 hosts." }
  ]
},
{ id: 9, d: "fund", t: "VLSM: Right-Sizing Subnets", min: 7,
  c: [
    "Variable Length Subnet Masking means using **different mask lengths inside the same network** so you stop wasting addresses — a /30 for a router link instead of burning a /24 on two hosts.",
    "The method: list requirements, **sort largest first**, and allocate from the top of your block down. Example from `192.168.1.0/24`: Sales needs 100 hosts → /25 (`.0-.127`). Engineering needs 50 → /26 (`.128-.191`). Guest needs 20 → /27 (`.192-.223`). Two WAN links → /30s (`.224-.227`, `.228-.231`).",
    "Allocating largest-first keeps blocks aligned on their natural boundaries — a /26 must start on a multiple of 64. Misaligned overlap is the classic VLSM trap answer."
  ],
  k: [
    "Sort subnets largest to smallest before allocating",
    "Each subnet must start on a multiple of its block size",
    "Point-to-point links get /30 (or /31 on modern gear)",
    "Overlapping ranges = the wrong answer they want you to pick"
  ],
  q: [
    { q: "First step when designing with VLSM?", o: ["Assign WAN links first", "Sort requirements largest to smallest", "Convert to binary", "Pick random blocks"], a: 1, e: "Largest-first keeps alignment clean and prevents overlap." },
    { q: "Best mask for a point-to-point WAN link?", o: ["/24", "/28", "/30", "/32"], a: 2, e: "/30 = exactly 2 usable addresses." },
    { q: "After 192.168.1.0/25 is assigned, which is the next valid /26?", o: ["192.168.1.64", "192.168.1.128", "192.168.1.100", "192.168.1.192"], a: 1, e: "The /25 covers .0-.127; the next aligned /26 starts at .128." }
  ]
},
{ id: 10, d: "fund", t: "IPv6 I: Format & Shortening", min: 6,
  c: [
    "IPv6 is **128 bits** — eight groups of four hex digits (hextets) separated by colons. `2001:0db8:0000:0000:0000:0000:0000:0001`.",
    "Two shortening rules: (1) drop leading zeros in each hextet, (2) compress **one** longest run of all-zero hextets to `::`. That address becomes `2001:db8::1`. You can only use `::` once — twice would be ambiguous.",
    "No broadcast in IPv6. Prefix notation replaces masks: `/64` is the standard LAN size — the first 64 bits are the network, the last 64 the interface ID. A typical enterprise gets a /48 and carves 65,536 /64s from it."
  ],
  k: [
    "128 bits, hex, colons; :: used at most once",
    "Standard LAN prefix is /64",
    "No broadcast addresses — multicast replaces it",
    "Exam tests picking the correctly abbreviated address"
  ],
  q: [
    { q: "Which is the correct abbreviation of 2001:0db8:0000:0000:00a0:0000:0000:0001?", o: ["2001:db8::a0::1", "2001:db8:0:0:a0::1", "2001:db8::a::1", "2001:0db8::a0:0:0:1"], a: 1, e: "Only one :: is allowed — compress the longest zero run (the last two hextets) and drop leading zeros elsewhere." },
    { q: "How many bits in an IPv6 address?", o: ["32", "64", "96", "128"], a: 3, e: "128 bits, typically a /64 split between prefix and interface ID." },
    { q: "IPv6 has no:", o: ["Unicast", "Multicast", "Broadcast", "Anycast"], a: 2, e: "Broadcast is gone; all-nodes multicast FF02::1 covers that job." }
  ]
},
{ id: 11, d: "fund", t: "IPv6 II: Address Types, SLAAC & ND", min: 7,
  c: [
    "Address types by prefix: **Global unicast** `2000::/3` (public), **unique local** `FC00::/7` (private-ish), **link-local** `FE80::/10` (auto on every interface, never routed), **multicast** `FF00::/8`. Key multicasts: `FF02::1` all nodes, `FF02::2` all routers.",
    "Interface IDs can come from **EUI-64**: split the 48-bit MAC, insert `FFFE` in the middle, flip the 7th bit of the first byte. Or from **SLAAC**: the host hears a Router Advertisement (RA), takes the /64 prefix, and builds its own address — no DHCP server needed.",
    "Neighbor Discovery (ICMPv6) replaces ARP: **Neighbor Solicitation/Neighbor Advertisement** resolve MACs, RS/RA handle router discovery. On a Cisco router, nothing routes until you enter `ipv6 unicast-routing`."
  ],
  k: [
    "FE80::/10 link-local exists on every IPv6 interface automatically",
    "SLAAC = self-addressing from RA messages (ICMPv6)",
    "EUI-64: insert FFFE, flip bit 7",
    "NS/NA replace ARP; FF02::1 all nodes, FF02::2 all routers"
  ],
  cmd: ["ipv6 unicast-routing", "interface g0/0", " ipv6 address 2001:db8:1::1/64", "show ipv6 interface brief"],
  q: [
    { q: "Which prefix identifies an IPv6 link-local address?", o: ["2000::/3", "FC00::/7", "FE80::/10", "FF00::/8"], a: 2, e: "FE80::/10 — automatic, valid only on the local link." },
    { q: "SLAAC builds an address using information from:", o: ["A DHCPv6 server", "Router Advertisements", "DNS AAAA records", "ARP replies"], a: 1, e: "The host combines the RA's prefix with its own interface ID." },
    { q: "In EUI-64, what is inserted into the middle of the MAC?", o: ["0000", "FFFE", "FEFF", "1234"], a: 1, e: "FFFE goes between the OUI and device halves; bit 7 is flipped." }
  ]
},
{ id: 12, d: "fund", t: "Network Architectures & WAN Concepts", min: 6,
  c: [
    "Campus designs: **2-tier (collapsed core)** = access switches uplinked to a combined core/distribution layer — typical for a site like a single building. **3-tier** adds a dedicated core between distribution blocks for large campuses (think a shipyard-scale network).",
    "Data centers favor **spine-leaf**: every leaf connects to every spine, giving predictable two-hop east-west paths for server-to-server traffic.",
    "WAN options to recognize: MPLS from a provider, Metro Ethernet, site-to-site **VPN over internet**, and dual-homed internet edges. **SOHO** routers collapse router, switch, AP, and firewall into one box. On-prem vs cloud: IaaS/SaaS just relocate where these tiers live."
  ],
  k: [
    "2-tier = collapsed core; 3-tier = access, distribution, core",
    "Spine-leaf: every leaf to every spine, built for east-west traffic",
    "MPLS, Metro-E, and internet VPN are the WAN answers",
    "Redundancy vocabulary: single vs dual-homed"
  ],
  q: [
    { q: "Which design gives every leaf switch an equal-length path to any other leaf?", o: ["3-tier", "Collapsed core", "Spine-leaf", "Ring"], a: 2, e: "Spine-leaf guarantees leaf-spine-leaf, ideal for data centers." },
    { q: "A collapsed-core design merges which two layers?", o: ["Access and distribution", "Core and distribution", "Access and core", "Core and WAN"], a: 1, e: "2-tier combines core + distribution above the access layer." },
    { q: "'East-west traffic' refers to:", o: ["Branch to HQ", "Server-to-server within a DC", "User to internet", "Router to ISP"], a: 1, e: "Lateral flows inside the data center — spine-leaf's specialty." }
  ]
},
{ id: 13, d: "fund", t: "Virtualization: VMs, Containers & VRF", min: 6,
  c: [
    "A **hypervisor** lets multiple virtual machines share one physical server. **Type 1** runs on bare metal (ESXi, Hyper-V, KVM/Proxmox — like your home lab). **Type 2** runs on top of a host OS (VirtualBox, VMware Workstation). Each VM carries its own full guest OS.",
    "**Containers** (Docker) share the host kernel through a container engine — no guest OS per instance, so they start in seconds and pack far denser than VMs. Trade-off: less isolation than a VM.",
    "Networks virtualize too: **VRF** (Virtual Routing and Forwarding) gives one physical router multiple isolated routing tables — same idea as VLANs, but at Layer 3. Virtual switches connect VM vNICs inside the host."
  ],
  k: [
    "Type 1 hypervisor = bare metal; Type 2 = hosted on an OS",
    "Containers share the host kernel; VMs each run a full OS",
    "Containers boot faster and use fewer resources than VMs",
    "VRF = multiple routing tables on one router"
  ],
  q: [
    { q: "Which is a Type 1 hypervisor?", o: ["VirtualBox", "VMware Workstation", "VMware ESXi", "Docker Desktop"], a: 2, e: "ESXi installs on bare metal. VirtualBox/Workstation are Type 2." },
    { q: "The key difference of containers vs VMs is that containers:", o: ["Include a full guest OS", "Share the host OS kernel", "Require more RAM", "Cannot be networked"], a: 1, e: "One kernel, many isolated processes — light and fast." },
    { q: "VRF technology provides:", o: ["Multiple MAC tables on a switch", "Multiple isolated routing tables on one router", "Encrypted tunnels", "Wireless segmentation"], a: 1, e: "VRFs split L3 the way VLANs split L2." }
  ]
},
{ id: 14, d: "fund", t: "Cabling, PoE & Interface Issues", min: 7,
  c: [
    "Copper UTP with RJ45: **Cat5e** = 1 Gb/100 m, **Cat6** = 10 Gb to ~55 m, **Cat6a** = 10 Gb/100 m. Fiber: **multimode** (short runs, cheaper optics) vs **single-mode** (long haul, laser). Modern ports auto-MDIX, so crossover-vs-straight rarely bites anymore.",
    "**PoE** puts DC power on the data pairs: 802.3af = 15.4 W, 802.3at (PoE+) = 30 W, 802.3bt = 60/100 W. The switch (PSE) powers phones and APs (PDs) and can police draw.",
    "Interface counters tell stories: **runts** (<64 B) and **CRC errors** suggest bad cable or duplex mismatch; **late collisions** are the classic **duplex mismatch** symptom (one side half, one full). `show interfaces` speed/duplex lines confirm; mismatches happen when autonegotiation is disabled on only one side."
  ],
  k: [
    "Cat5e 1G, Cat6a 10G at 100 m; SMF for long distance",
    "PoE af=15.4 W, at=30 W, bt up to 90-100 W",
    "Late collisions ≈ duplex mismatch — top exam symptom",
    "CRC + input errors point to L1 problems (cable/SFP)"
  ],
  cmd: ["show interfaces g0/1", "show interfaces status", "show power inline"],
  q: [
    { q: "Late collisions on an interface most likely indicate:", o: ["A routing loop", "A duplex mismatch", "DNS failure", "Wrong VLAN"], a: 1, e: "Half-duplex on one end + full on the other = late collisions." },
    { q: "Which standard delivers 30 W PoE?", o: ["802.3af", "802.3at", "802.3bt", "802.1Q"], a: 1, e: "802.3at (PoE+) = 30 W. af is 15.4 W, bt goes higher." },
    { q: "Best media for a 5 km campus link?", o: ["Cat6a UTP", "Multimode fiber", "Single-mode fiber", "Coax"], a: 2, e: "Single-mode handles long distances; copper stops at 100 m." }
  ]
},
{ id: 15, d: "fund", t: "Wireless Principles: RF, Channels & SSIDs", min: 6,
  c: [
    "Wi-Fi lives in **2.4 GHz** (longer range, crowded, only channels **1, 6, 11** are non-overlapping in the US), **5 GHz** (more channels, faster, some require DFS to dodge radar), and **6 GHz** (Wi-Fi 6E, clean spectrum).",
    "Vocabulary: an AP and its clients form a **BSS**, identified by the **BSSID** (the AP's radio MAC). The **SSID** is the human-readable name. Multiple APs sharing an SSID over a wired distribution system form an **ESS** — that is what lets you roam.",
    "Wider channels (40/80/160 MHz) mean more throughput but fewer non-overlapping choices. Neighboring APs on the same channel cause co-channel interference; overlapping channels (like 3 and 6) are worse."
  ],
  k: [
    "2.4 GHz non-overlapping channels: 1, 6, 11",
    "BSSID = AP radio MAC; SSID = network name; ESS = roaming across APs",
    "5/6 GHz: more channels, shorter range, higher speed",
    "Adjacent APs should sit on different non-overlapping channels"
  ],
  q: [
    { q: "Which 2.4 GHz channels do not overlap (US)?", o: ["1, 5, 9", "1, 6, 11", "2, 7, 12", "1, 4, 8"], a: 1, e: "1/6/11 are the only clean trio in 2.4 GHz." },
    { q: "The BSSID is:", o: ["The Wi-Fi password", "The AP radio's MAC address", "The controller IP", "The channel number"], a: 1, e: "Each BSS is identified by its AP's radio MAC." },
    { q: "An ESS is best described as:", o: ["One AP, one client", "Multiple APs sharing one SSID", "An ad-hoc network", "A mesh backhaul"], a: 1, e: "Extended Service Set = several BSSs presenting the same SSID." }
  ]
},
{ id: 16, d: "acc", t: "VLANs: Segmenting at Layer 2", min: 6,
  c: [
    "A VLAN is a broadcast domain carved out of a switch. Ports in VLAN 10 never hear VLAN 20's broadcasts, even on the same hardware. Use them to separate departments, voice, guests, and management traffic.",
    "Cisco ranges: VLAN 1 is the default (everything starts there — move off it), 1002-1005 are legacy reserved, normal range runs to 1005, extended 1006-4094.",
    "Config is two moves: create the VLAN, then assign access ports to it. A **voice VLAN** rides the same access port for an IP phone (`switchport voice vlan 150`) — the phone tags voice frames while the PC behind it stays untagged in the data VLAN."
  ],
  k: [
    "One VLAN = one broadcast domain = (usually) one subnet",
    "Traffic between VLANs requires a Layer 3 device — always",
    "Best practice: don't use VLAN 1 for user or management traffic",
    "Access port = one data VLAN (+ optional voice VLAN)"
  ],
  cmd: ["vlan 10", " name USERS", "interface g0/5", " switchport mode access", " switchport access vlan 10", " switchport voice vlan 150", "show vlan brief"],
  q: [
    { q: "Two PCs on the same switch, different VLANs. What do they need to communicate?", o: ["A crossover cable", "A Layer 3 device", "The same speed setting", "Nothing — same switch works"], a: 1, e: "Inter-VLAN traffic must be routed; L2 keeps them isolated." },
    { q: "Which command assigns a port to VLAN 10?", o: ["vlan access 10", "switchport access vlan 10", "switchport vlan 10 access", "vlan 10 assign"], a: 1, e: "Interface-level: switchport access vlan 10." },
    { q: "By default, every switch port belongs to:", o: ["VLAN 0", "VLAN 1", "VLAN 10", "No VLAN"], a: 1, e: "VLAN 1 is the factory default for all ports." }
  ]
},
{ id: 17, d: "acc", t: "Trunking & 802.1Q", min: 7,
  c: [
    "A **trunk** carries multiple VLANs between switches (or to a router/AP). **802.1Q** inserts a 4-byte tag into the Ethernet frame with the 12-bit VLAN ID — that is how the far end knows which VLAN each frame belongs to.",
    "The **native VLAN** is the one VLAN sent **untagged** on a trunk (default VLAN 1). Both ends must agree or you get leakage and CDP native-VLAN mismatch warnings. Best practice: set it to an unused VLAN.",
    "You can prune with `switchport trunk allowed vlan`. Careful at work and on the exam: `allowed vlan 30` **replaces** the list; use `add` to append."
  ],
  k: [
    "802.1Q tag = 4 bytes, 12-bit VLAN ID (hence 4094 usable VLANs)",
    "Native VLAN travels untagged and must match on both ends",
    "allowed vlan add vs allowed vlan — replacing the list is a classic outage",
    "Router and WLC links are usually trunks"
  ],
  cmd: ["interface g0/24", " switchport trunk encapsulation dot1q", " switchport mode trunk", " switchport trunk native vlan 999", " switchport trunk allowed vlan 10,20,150", "show interfaces trunk"],
  q: [
    { q: "How does 802.1Q identify a frame's VLAN?", o: ["It rewrites the source MAC", "It inserts a 4-byte tag with the VLAN ID", "It changes the EtherType only", "It encapsulates in GRE"], a: 1, e: "A tag carrying a 12-bit VLAN ID is inserted into the frame." },
    { q: "Frames on the native VLAN are sent:", o: ["Tagged with ID 1", "Untagged", "Encrypted", "Only as broadcasts"], a: 1, e: "Native VLAN = the untagged VLAN on an 802.1Q trunk." },
    { q: "A trunk allows 10,20. You type 'switchport trunk allowed vlan 30'. Result?", o: ["10,20,30 allowed", "Only 30 allowed", "Command rejected", "All VLANs allowed"], a: 1, e: "Without 'add', the list is replaced — VLANs 10/20 just went dark." }
  ]
},
{ id: 18, d: "acc", t: "DTP & VTP: Negotiation You Should Tame", min: 6,
  c: [
    "**DTP** (Dynamic Trunking Protocol) lets ports negotiate trunking. Modes: `dynamic desirable` actively asks to trunk; `dynamic auto` accepts if asked. **Auto + auto = stays an access port** — a favorite exam trap. Security practice: hard-code `switchport mode trunk` (or access) and add `switchport nonegotiate`.",
    "**VTP** (VLAN Trunking Protocol) syncs the VLAN database across trunks. Modes: **server** (create/modify, advertises), **client** (accepts only), **transparent** (keeps its own, forwards ads), plus off.",
    "The horror story: plugging in a switch with a **higher revision number** can overwrite the whole domain's VLANs. Many shops run transparent mode everywhere for exactly that reason."
  ],
  k: [
    "desirable+auto = trunk; auto+auto = access",
    "nonegotiate disables DTP frames entirely",
    "VTP modes: server, client, transparent (transparent = safe default mindset)",
    "Higher config revision can wipe VLANs domain-wide"
  ],
  cmd: ["switchport mode trunk", "switchport nonegotiate", "show dtp interface g0/1", "show vtp status"],
  q: [
    { q: "Both trunk ends are set to dynamic auto. The link becomes:", o: ["A trunk", "An access port", "Err-disabled", "A routed port"], a: 1, e: "Auto is passive on both sides — nobody initiates, so no trunk." },
    { q: "Which VTP mode ignores updates and keeps a local VLAN database?", o: ["Server", "Client", "Transparent", "Primary"], a: 2, e: "Transparent forwards ads but never applies them." },
    { q: "Best practice to stop trunk negotiation attacks on access ports:", o: ["Enable VTP pruning", "switchport nonegotiate + static mode", "Raise the revision number", "Use VLAN 1"], a: 1, e: "Statically set the mode and disable DTP." }
  ]
},
{ id: 19, d: "acc", t: "Inter-VLAN Routing: ROAS & SVIs", min: 7,
  c: [
    "Option 1 — **Router-on-a-stick**: one trunk to a router, one **subinterface per VLAN**, each with `encapsulation dot1q <vlan>` and that VLAN's gateway IP. Cheap, fine for small sites, bottlenecked by the single link.",
    "Option 2 — **SVIs on a Layer 3 switch**: `interface vlan 10` gets the gateway IP, and `ip routing` turns on forwarding between them. This is how real campuses do it — routing at wire speed in the distribution layer.",
    "Either way, every host's default gateway is the SVI/subinterface IP for its own VLAN. Wrong-gateway tickets are the desk version of this lesson."
  ],
  k: [
    "ROAS: subinterfaces + encapsulation dot1q <id> + IP",
    "SVI: interface vlan X with an IP; requires ip routing on the switch",
    "The VLAN must exist and have an up port for its SVI to come up",
    "Gateway for each host = its VLAN's L3 interface"
  ],
  cmd: ["! ROAS", "interface g0/0.10", " encapsulation dot1q 10", " ip address 10.10.10.1 255.255.255.0", "! L3 switch", "ip routing", "interface vlan 10", " ip address 10.10.10.1 255.255.255.0"],
  q: [
    { q: "Which command binds a router subinterface to VLAN 20?", o: ["switchport access vlan 20", "encapsulation dot1q 20", "vlan 20 routing", "trunk vlan 20"], a: 1, e: "Subinterfaces tag/untag with encapsulation dot1q 20." },
    { q: "For SVIs to route between VLANs, a multilayer switch needs:", o: ["ip routing enabled", "A DHCP pool", "VTP server mode", "PortFast"], a: 0, e: "SVIs exist without it, but forwarding requires ip routing." },
    { q: "Main drawback of router-on-a-stick?", o: ["Needs one NIC per VLAN", "All inter-VLAN traffic shares one trunk link", "Cannot use 802.1Q", "Requires Layer 3 switch"], a: 1, e: "Every routed flow hairpins over that single trunk." }
  ]
},
{ id: 20, d: "acc", t: "Spanning Tree I: Root Bridge & Port Roles", min: 8,
  c: [
    "Redundant switch links create loops, and Layer 2 has no TTL — one loop means a broadcast storm. **STP (802.1D)** blocks just enough ports to leave a single loop-free tree.",
    "Election: lowest **Bridge ID** wins root. BID = **priority (default 32768 + VLAN number in PVST) + MAC**, so with default priorities the **lowest MAC** becomes root — usually the oldest switch, which is why you set priority manually (`spanning-tree vlan 10 root primary` or priority 4096).",
    "Port roles: every non-root switch picks one **root port** (lowest cost path to root); each segment gets one **designated port** (the root has only designated ports); everything else **blocks**. Costs: 100 Mb=19, 1 Gb=4, 10 Gb=2 (short mode)."
  ],
  k: [
    "Lowest BID = root; priority steps of 4096",
    "Root port = best path to root, one per non-root switch",
    "All root bridge ports are designated",
    "Tiebreakers: lowest cost → lowest neighbor BID → lowest port ID"
  ],
  cmd: ["show spanning-tree", "spanning-tree vlan 10 priority 4096", "spanning-tree vlan 10 root primary"],
  q: [
    { q: "With all defaults, which switch becomes STP root?", o: ["Highest MAC", "Lowest MAC", "Fastest CPU", "Most ports"], a: 1, e: "Equal priorities fall through to lowest MAC address." },
    { q: "How many root ports does the root bridge have?", o: ["One", "One per VLAN", "Zero", "Two"], a: 2, e: "The root has no root port — all its ports are designated." },
    { q: "STP exists primarily to prevent:", o: ["IP conflicts", "Layer 2 loops and broadcast storms", "VLAN hopping", "Duplex mismatch"], a: 1, e: "It blocks redundant paths so frames can't circulate forever." }
  ]
},
{ id: 21, d: "acc", t: "Spanning Tree II: States, PortFast & BPDU Guard", min: 7,
  c: [
    "Classic 802.1D port states: **blocking → listening → learning → forwarding** (plus disabled). Listening and learning each run one forward-delay (15 s), so a port takes ~30 seconds to pass traffic — and up to 50 s after a failure (20 s max-age first).",
    "That delay is brutal for a PC or phone booting up, so **PortFast** skips straight to forwarding on **edge/access ports only**. Never on switch-to-switch links.",
    "PortFast's bodyguard is **BPDU Guard**: if a BPDU ever arrives on that port (someone plugged in a switch), the port goes **err-disabled** instantly. Related tools: **Root Guard** stops a port from ever becoming a root port (protects your root placement); loop guard protects against unidirectional failures."
  ],
  k: [
    "States in order: blocking, listening, learning, forwarding",
    "Legacy convergence: 30-50 seconds",
    "PortFast = access ports only; pair it with BPDU Guard",
    "BPDU received on a guarded port → err-disabled"
  ],
  cmd: ["interface g0/5", " spanning-tree portfast", " spanning-tree bpduguard enable", "spanning-tree portfast bpduguard default", "show interfaces status err-disabled"],
  q: [
    { q: "Correct order of 802.1D states toward forwarding?", o: ["Listening, blocking, learning, forwarding", "Blocking, listening, learning, forwarding", "Learning, listening, forwarding", "Blocking, learning, listening, forwarding"], a: 1, e: "Block → listen → learn → forward." },
    { q: "BPDU Guard reacts to a received BPDU by:", o: ["Electing a new root", "Err-disabling the port", "Flooding the BPDU", "Ignoring it"], a: 1, e: "The port is shut down (err-disabled) to stop rogue switches." },
    { q: "PortFast is safe on:", o: ["Trunks between switches", "Ports to end hosts", "All ports", "The root bridge uplink"], a: 1, e: "Only edge ports — a switch on a PortFast port can loop the network." }
  ]
},
{ id: 22, d: "acc", t: "Rapid Spanning Tree (802.1w)", min: 6,
  c: [
    "RSTP is STP with the waiting removed — convergence in about a second via a proposal/agreement handshake on point-to-point links instead of timers. Cisco's default flavor is **Rapid PVST+**: one RSTP instance per VLAN.",
    "States shrink to three: **discarding, learning, forwarding** (blocking/listening collapse into discarding). Roles gain two standby types: **alternate** (backup path toward root — replaces a failed root port instantly) and **backup** (backup for a designated port on shared media, rare).",
    "RSTP builds edge behavior in — an edge port is just PortFast by another name, still configured the same way. Same root election, same BID math, so everything from lesson 20 still applies."
  ],
  k: [
    "Rapid PVST+ = one tree per VLAN, sub-second convergence",
    "States: discarding, learning, forwarding",
    "Alternate port = ready-now replacement root port",
    "Root election rules unchanged from classic STP"
  ],
  cmd: ["spanning-tree mode rapid-pvst", "show spanning-tree summary"],
  q: [
    { q: "Which state exists in RSTP but replaces two 802.1D states?", o: ["Learning", "Forwarding", "Discarding", "Listening"], a: 2, e: "Discarding absorbs blocking and listening." },
    { q: "An RSTP alternate port is:", o: ["A second designated port", "A backup path toward the root bridge", "An err-disabled port", "A trunk-only role"], a: 1, e: "It takes over immediately if the root port fails." },
    { q: "Cisco's per-VLAN rapid implementation is called:", o: ["MSTP", "PVST", "Rapid PVST+", "RSTP-VL"], a: 2, e: "Rapid PVST+ runs an 802.1w instance for each VLAN." }
  ]
},
{ id: 23, d: "acc", t: "EtherChannel: Bundling Links", min: 7,
  c: [
    "EtherChannel bonds up to 8 physical links into one logical **port-channel** — more bandwidth, and STP sees a single interface so nothing gets blocked.",
    "Negotiation protocols: **LACP** (802.3ad, open standard) with modes `active` (initiates) and `passive` (responds) — active+active or active+passive forms a bundle. **PAgP** (Cisco) uses `desirable`/`auto` the same way. Mode `on` forces static bundling with no protocol — both sides must be `on`.",
    "Every member link must match: speed, duplex, access/trunk mode, allowed VLANs. Mismatch = links suspended. Load balancing hashes flows (src/dst MAC or IP) across members — one flow always rides one link."
  ],
  k: [
    "LACP: active/passive · PAgP: desirable/auto · static: on/on",
    "passive+passive (or auto+auto) never forms a channel",
    "Member configs must match exactly",
    "Configure the port-channel interface; members inherit"
  ],
  cmd: ["interface range g0/1 - 2", " channel-group 1 mode active", "interface port-channel 1", " switchport mode trunk", "show etherchannel summary"],
  q: [
    { q: "Which mode pair forms an LACP EtherChannel?", o: ["passive + passive", "active + passive", "auto + auto", "desirable + on"], a: 1, e: "At least one side must be active. Two passives never negotiate." },
    { q: "PAgP is:", o: ["An IEEE standard", "Cisco proprietary", "A routing protocol", "Deprecated STP"], a: 1, e: "PAgP is Cisco-only; LACP is the 802.3ad standard." },
    { q: "A major benefit of EtherChannel with STP is:", o: ["STP blocks all member links", "STP treats the bundle as one link, so none are blocked", "STP is disabled", "Faster MAC aging"], a: 1, e: "One logical interface = no redundant-path blocking within the bundle." }
  ]
},
{ id: 24, d: "acc", t: "CDP & LLDP: Discovery Protocols", min: 5,
  c: [
    "**CDP** is Cisco-proprietary, on by default, advertising every 60 s with a 180 s holdtime. `show cdp neighbors detail` reveals the neighbor's hostname, platform, IOS, and **IP address** — gold when you're mapping an unfamiliar closet.",
    "**LLDP** (802.1AB) is the vendor-neutral equivalent — required when Cisco talks to non-Cisco. Disabled by default on Cisco gear (`lldp run` enables it); timers 30 s advertise / 120 s hold.",
    "Security angle: these protocols happily describe your network to anyone listening, so disable them on user-facing and internet-facing ports (`no cdp enable` per interface)."
  ],
  k: [
    "CDP: Cisco, default on, 60/180 timers",
    "LLDP: open standard, default off on Cisco, 30/120 timers",
    "'detail' output includes the neighbor's management IP",
    "Disable discovery on untrusted/edge ports"
  ],
  cmd: ["show cdp neighbors detail", "lldp run", "show lldp neighbors", "interface g0/10", " no cdp enable"],
  q: [
    { q: "Which protocol discovers a directly connected non-Cisco switch?", o: ["CDP", "LLDP", "VTP", "DTP"], a: 1, e: "LLDP is the IEEE standard both vendors speak." },
    { q: "Default CDP advertisement interval?", o: ["30 s", "60 s", "120 s", "180 s"], a: 1, e: "60 seconds, with a 180-second holdtime." },
    { q: "Which command shows a neighbor's IOS version and IP?", o: ["show cdp neighbors", "show cdp neighbors detail", "show interfaces", "show lldp"], a: 1, e: "The detail keyword adds IP, version, and platform info." }
  ]
},
{ id: 25, d: "acc", t: "Wireless Architectures: WLC & AP Modes", min: 7,
  c: [
    "**Autonomous APs** are self-contained — fine for a few, unmanageable for a shipyard. Enterprise uses **lightweight APs** managed by a **Wireless LAN Controller** in a **split-MAC** design: the AP handles real-time radio work; the WLC handles auth, roaming, RF management, and policy.",
    "AP-to-WLC traffic rides **CAPWAP** tunnels: UDP **5246** (control, encrypted) and **5247** (data). Because data can tunnel to the controller, the AP's switch port is typically an access port; the WLC's is a trunk.",
    "Lightweight AP modes: **local** (default — serves clients, scans off-channel), **FlexConnect** (switches traffic locally at a branch; survives WAN loss), **monitor** (dedicated sensor, no clients), **sniffer** (feeds packets to Wireshark), **rogue detector**, **bridge/mesh**, **SE-connect** (spectrum analysis)."
  ],
  k: [
    "Split-MAC: AP = real-time RF, WLC = management/control",
    "CAPWAP: UDP 5246 control / 5247 data",
    "FlexConnect keeps branch Wi-Fi alive when the WAN dies",
    "Monitor and sniffer modes serve zero clients"
  ],
  q: [
    { q: "CAPWAP control traffic uses:", o: ["TCP 443", "UDP 5246", "UDP 5247", "TCP 22"], a: 1, e: "5246 = control (encrypted); 5247 = data tunnel." },
    { q: "Which AP mode forwards client traffic locally at a remote site?", o: ["Local", "Monitor", "FlexConnect", "Sniffer"], a: 2, e: "FlexConnect switches locally instead of tunneling to the WLC." },
    { q: "In split-MAC, client authentication is handled by:", o: ["The AP", "The WLC", "The nearest switch", "The DHCP server"], a: 1, e: "Management functions like auth live on the controller." }
  ]
},
{ id: 26, d: "acc", t: "WLC Configuration Essentials", min: 6,
  c: [
    "WLC physical **ports**: distribution system ports (trunk uplinks, often an LAG), a service port (out-of-band mgmt), redundancy port. Logical **interfaces**: the **management interface** (CAPWAP terminates here, your GUI/SSH target), the **virtual interface** (a fake IP like 192.0.2.1 used for client web-auth/DHCP relay), and **dynamic interfaces** — each one maps a WLAN to a wired VLAN.",
    "Creating a WLAN: define profile name + **SSID**, bind it to a dynamic interface (that's the VLAN its clients land in), pick security (WPA2/WPA3-PSK or 802.1X), enable it. A WLC supports multiple WLANs broadcast by the same APs.",
    "Management access: HTTPS GUI, SSH, and you can restrict which upstream networks may manage it. Same hygiene as switches — no Telnet, no HTTP."
  ],
  k: [
    "Management interface = where APs join and admins connect",
    "Dynamic interface = WLAN-to-VLAN mapping",
    "Virtual interface = client-facing helper (web auth), unroutable IP",
    "WLAN = SSID + interface + security policy"
  ],
  q: [
    { q: "Which WLC interface maps a WLAN to a specific VLAN?", o: ["Management", "Virtual", "Dynamic", "Service"], a: 2, e: "Dynamic interfaces tie SSIDs to wired VLANs." },
    { q: "Lightweight APs build their CAPWAP tunnel to the WLC's:", o: ["Virtual interface", "Management interface", "Service port", "Redundancy port"], a: 1, e: "The management interface terminates CAPWAP and admin sessions." },
    { q: "Secure ways to administer a WLC include:", o: ["Telnet and HTTP", "HTTPS and SSH", "TFTP only", "SNMPv1"], a: 1, e: "Encrypted management only — HTTPS GUI and SSH CLI." }
  ]
},
{ id: 27, d: "ip", t: "Reading the Routing Table", min: 7,
  c: [
    "`show ip route` is the router's brain dump. Codes: **C** connected, **L** local (/32 for the router's own IP), **S** static, **O** OSPF, **D** EIGRP, **B** BGP. Each entry: `[AD/metric] via next-hop, interface`.",
    "**Administrative distance** ranks trust between *sources* for the same prefix; **metric** ranks paths *within* one protocol. `O 10.2.0.0/16 [110/74] via 10.1.12.2` reads: OSPF route, AD 110, cost 74.",
    "A router only installs the best route per prefix and only uses routes whose next hop it can resolve. The **gateway of last resort** line reflects your default route — 'not set' means unmatched packets get dropped."
  ],
  k: [
    "C/L appear automatically when an interface gets an IP and comes up",
    "Format: [AD/metric] via next-hop",
    "L routes are /32s for the router's own addresses",
    "Gateway of last resort = default route status"
  ],
  cmd: ["show ip route", "show ip route 10.2.2.2", "show ip interface brief"],
  q: [
    { q: "In [110/74], the 110 represents:", o: ["The metric", "Administrative distance", "Hop count", "The process ID"], a: 1, e: "AD first, metric second. 110 = OSPF's AD." },
    { q: "Which code marks a router's own interface address as a /32?", o: ["C", "L", "S", "O"], a: 1, e: "L = local host route for the interface IP itself." },
    { q: "'Gateway of last resort is not set' means:", o: ["OSPF is down", "No default route exists", "DNS is unreachable", "NAT is disabled"], a: 1, e: "Packets matching no route will be dropped." }
  ]
},
{ id: 28, d: "ip", t: "Longest Prefix Match: The Forwarding Decision", min: 6,
  c: [
    "When a packet arrives, the router picks the route with the **longest matching prefix** — the most specific one. This beats everything: a /28 beats a /24 beats a /16 beats 0.0.0.0/0, regardless of AD or metric.",
    "AD and metric are only tiebreakers used **earlier**, when deciding which candidate for the *same* prefix gets installed in the table. Forwarding itself is pure longest-match against what's installed.",
    "Example: table holds 10.0.0.0/8 via A, 10.1.0.0/16 via B, 10.1.1.0/24 via C, and 0.0.0.0/0 via D. A packet to 10.1.1.55 goes via **C**. A packet to 10.2.9.9 goes via **A**. A packet to 8.8.8.8 goes via **D**."
  ],
  k: [
    "Most specific prefix wins the forwarding decision — always",
    "AD compares sources; metric compares paths; both happen before installation",
    "Default route 0.0.0.0/0 matches everything but loses to anything",
    "Exam gives a table + destination: trace the longest match"
  ],
  q: [
    { q: "Table has 172.16.0.0/16 via A and 172.16.5.0/24 via B. Packet to 172.16.5.99 uses:", o: ["A", "B", "Load-balanced", "Dropped"], a: 1, e: "/24 is more specific than /16 — longest prefix wins." },
    { q: "Which route matches every destination but is chosen last?", o: ["A /32 host route", "0.0.0.0/0", "The connected route", "127.0.0.0/8"], a: 1, e: "The default route is the least-specific catch-all." },
    { q: "When does administrative distance apply?", o: ["Per packet at forwarding time", "When choosing between sources offering the same prefix", "Only for static routes", "Never on Cisco"], a: 1, e: "AD decides what enters the table; forwarding uses longest match." }
  ]
},
{ id: 29, d: "ip", t: "Static & Default Routes", min: 7,
  c: [
    "Syntax: `ip route <network> <mask> <next-hop | exit-interface>`. Prefer specifying the **next-hop IP** (or interface + next-hop together). On multi-access links, an interface-only static forces the router to ARP for every destination — messy.",
    "The **default route** `ip route 0.0.0.0 0.0.0.0 <next-hop>` catches everything unmatched — standard at branch edges pointing at the ISP or hub.",
    "Statics have **AD 1**, so they beat every dynamic protocol. They never adapt, though: if the path breaks beyond the next hop, the route stays up and blackholes traffic. That trade-off sets up tomorrow's lesson."
  ],
  k: [
    "ip route NET MASK NEXT-HOP — AD 1 by default",
    "Default route = 0.0.0.0 0.0.0.0",
    "A static stays installed as long as its next-hop/interface is resolvable",
    "Verify with show ip route static"
  ],
  cmd: ["ip route 10.20.0.0 255.255.0.0 10.1.12.2", "ip route 0.0.0.0 0.0.0.0 203.0.113.1", "show ip route static"],
  q: [
    { q: "Default administrative distance of a static route?", o: ["0", "1", "90", "110"], a: 1, e: "Static = 1. Only connected (0) is lower." },
    { q: "Which command creates a default route?", o: ["ip default 255.255.255.255", "ip route 0.0.0.0 0.0.0.0 198.51.100.1", "ip route any any 198.51.100.1", "route default add"], a: 1, e: "All-zeros network and mask = match everything." },
    { q: "A static route pointing only at an Ethernet exit interface causes:", o: ["Lower AD", "ARP requests for every destination", "Automatic failover", "Recursive lookup loops"], a: 1, e: "Without a next-hop, the router treats destinations as directly connected and ARPs for each." }
  ]
},
{ id: 30, d: "ip", t: "Floating Statics, Host Routes & IPv6 Statics", min: 6,
  c: [
    "A **floating static** is a backup: same destination, but with an AD **higher** than the primary route's, so it stays out of the table until the primary disappears. Example: OSPF (110) is primary; `ip route 0.0.0.0 0.0.0.0 198.51.100.1 115` floats behind it.",
    "A **host route** is a /32 (`255.255.255.255`) targeting one address — handy for steering a single server or a loopback.",
    "IPv6 statics mirror IPv4: `ipv6 route 2001:db8:2::/64 2001:db8:12::2` (remember `ipv6 unicast-routing` first). If the next hop is a **link-local** address, you must include the exit interface: `ipv6 route ::/0 g0/0 FE80::1`."
  ],
  k: [
    "Floating static AD > primary's AD; installs only on failure",
    "/32 = one host; IPv6 equivalent is /128",
    "IPv6 default route = ::/0",
    "Link-local next hop requires the exit interface in the command"
  ],
  cmd: ["ip route 0.0.0.0 0.0.0.0 198.51.100.1 115", "ip route 10.9.9.9 255.255.255.255 10.1.1.2", "ipv6 route ::/0 g0/0 FE80::1"],
  q: [
    { q: "OSPF provides the primary path (AD 110). A valid floating static backup uses AD:", o: ["1", "90", "110", "120"], a: 3, e: "It must be numerically higher than 110 to stay dormant." },
    { q: "The IPv6 default route is written as:", o: ["0.0.0.0/0", "::/0", "FF00::/8", "::1/128"], a: 1, e: "::/0 matches all IPv6 destinations." },
    { q: "Why include an exit interface with a link-local next hop?", o: ["Link-locals are slower", "The same FE80:: address can exist on every link", "IOS forbids next-hops", "It lowers the AD"], a: 1, e: "Link-local scope is per-interface, so the router needs to know which link." }
  ]
},
{ id: 31, d: "ip", t: "Administrative Distance: The Trust Table", min: 5,
  c: [
    "When two different sources offer the *same prefix*, the router installs the one with the **lowest AD**. Memorize the ladder: **Connected 0 · Static 1 · eBGP 20 · EIGRP 90 · OSPF 110 · IS-IS 115 · RIP 120 · iBGP 200**. Unreachable/untrusted = 255 (never installed).",
    "So a static route beats OSPF for the same network, and OSPF beats RIP. This is also the mechanism floating statics exploit.",
    "Remember the order of operations: **longest prefix** decides forwarding; **AD** decides between sources for a tie; **metric** decides between paths within one protocol."
  ],
  k: [
    "0, 1, 20, 90, 110, 115, 120, 200 — drill it",
    "Lower AD = more trusted",
    "AD only matters when prefixes are identical",
    "255 means the route is rejected outright"
  ],
  q: [
    { q: "OSPF and EIGRP both learn 10.5.0.0/16. Which is installed?", o: ["OSPF (110)", "EIGRP (90)", "Both, load-balanced", "Neither"], a: 1, e: "EIGRP's AD 90 beats OSPF's 110." },
    { q: "Administrative distance of eBGP?", o: ["1", "20", "110", "200"], a: 1, e: "External BGP = 20; internal BGP = 200." },
    { q: "A route with AD 255 is:", o: ["Preferred over all", "Installed as backup", "Never installed", "Static only"], a: 2, e: "255 = do not trust this source." }
  ]
},
{ id: 32, d: "ip", t: "Dynamic Routing: Families & Behaviors", min: 6,
  c: [
    "**IGPs** route inside one organization (OSPF, EIGRP, RIP, IS-IS); **BGP** is the EGP gluing organizations/the internet together.",
    "**Distance-vector** protocols (RIP, historically EIGRP's family) learn from neighbors' summaries — routing by rumor. **Link-state** protocols (OSPF, IS-IS) flood link information so **every router builds an identical map** (the LSDB) and runs Dijkstra's SPF algorithm itself.",
    "Metrics differ: RIP counts hops (max 15), OSPF uses cumulative interface **cost** (bandwidth-based), EIGRP blends bandwidth + delay. Equal-metric paths get installed together = **ECMP** load balancing."
  ],
  k: [
    "IGP inside an AS; BGP between ASes",
    "Link-state = shared map + SPF; distance-vector = neighbor rumor",
    "OSPF metric is cost; RIP is hop count (15 max)",
    "Equal-cost multipath installs several best routes"
  ],
  q: [
    { q: "Which protocol is link-state?", o: ["RIP", "EIGRP", "OSPF", "BGP"], a: 2, e: "OSPF floods LSAs and runs SPF on a shared topology map." },
    { q: "The protocol designed to route between autonomous systems is:", o: ["OSPF", "RIP", "EIGRP", "BGP"], a: 3, e: "BGP is the exterior gateway protocol of the internet." },
    { q: "OSPF's metric is based on:", o: ["Hop count", "Interface cost derived from bandwidth", "Delay only", "MTU"], a: 1, e: "Cost = reference bandwidth / interface bandwidth, summed along the path." }
  ]
},
{ id: 33, d: "ip", t: "OSPF I: Neighbors, LSAs & Areas", min: 8,
  c: [
    "OSPF routers discover each other with **Hello** packets (multicast 224.0.0.5). On Ethernet: hello every **10 s**, dead after **40 s**. To become neighbors, these must match: **area ID, hello/dead timers, subnet, authentication, MTU** (for full adjacency) — and router IDs must be unique.",
    "Neighbor states climb: down → init → **2-way** (seen each other) → exstart → exchange → loading → **full** (databases synced). On broadcast networks, non-DR routers stop at 2-way with each other — that's normal, not broken.",
    "Routers flood **LSAs** into a shared **LSDB**, then each runs SPF for best paths. **Areas** contain flooding: area 0 is the backbone; every other area must touch it. Single-area area 0 is the common CCNA design."
  ],
  k: [
    "Hello 10 / dead 40 on Ethernet; both must match",
    "Match list: area, timers, subnet, auth, MTU; unique RIDs",
    "2-way between DROthers is expected behavior",
    "All areas connect to backbone area 0"
  ],
  q: [
    { q: "Two routers won't form an OSPF adjacency. Which mismatch could cause it?", o: ["Different process IDs", "Different hello timers", "Different hostnames", "Different uptimes"], a: 1, e: "Timers must match; process IDs are locally significant and can differ." },
    { q: "The 'full' state means:", o: ["Hellos received", "LSDBs are synchronized", "The router is the DR", "SPF is disabled"], a: 1, e: "Full = complete database exchange with that neighbor." },
    { q: "Which area must every other OSPF area connect to?", o: ["Area 1", "Area 0", "Area 51", "Any area"], a: 1, e: "Area 0 is the mandatory backbone." }
  ]
},
{ id: 34, d: "ip", t: "OSPF II: Configuration", min: 7,
  c: [
    "Two ways in. Classic: `router ospf 1` then `network 10.1.0.0 0.0.255.255 area 0` — the **wildcard mask** selects which interfaces join (it enables OSPF on interfaces, it doesn't advertise arbitrary ranges). Modern: `ip ospf 1 area 0` directly on the interface.",
    "**Router ID** selection order: manual `router-id` → highest **loopback** IP → highest active physical IP. Always set it manually; changes need `clear ip ospf process` to take effect.",
    "`passive-interface g0/1` keeps advertising that subnet but stops sending hellos out of it — standard on user-facing LANs so nobody peers with your access layer. `default-information originate` injects your default route into OSPF."
  ],
  k: [
    "network + wildcard = which interfaces run OSPF",
    "RID order: manual > highest loopback > highest physical",
    "Passive interface: advertise the subnet, form no neighbors",
    "Process ID is local — routers with different PIDs still peer"
  ],
  cmd: ["router ospf 1", " router-id 1.1.1.1", " network 10.1.12.0 0.0.0.3 area 0", " passive-interface g0/1", " default-information originate", "show ip ospf neighbor", "show ip protocols"],
  q: [
    { q: "network 172.16.1.0 0.0.0.255 area 0 does what?", o: ["Advertises a summary only", "Enables OSPF on interfaces in 172.16.1.0/24", "Blocks that subnet", "Sets the router ID"], a: 1, e: "The wildcard matches interface addresses to activate OSPF on them." },
    { q: "With no manual RID, a router picks:", o: ["Lowest physical IP", "Highest loopback IP", "The DR's ID", "A random value"], a: 1, e: "Highest loopback wins; only without loopbacks does it use physical IPs." },
    { q: "passive-interface on OSPF causes the interface to:", o: ["Shut down", "Stop sending hellos but still be advertised", "Become the DR", "Drop its IP"], a: 1, e: "The subnet stays in OSPF; adjacency formation stops." }
  ]
},
{ id: 35, d: "ip", t: "OSPF III: DR & BDR Elections", min: 6,
  c: [
    "On multi-access networks (Ethernet), full-mesh adjacencies would be chaos, so OSPF elects a **Designated Router** and **Backup DR**. Everyone forms full adjacencies only with the DR/BDR; DROthers stay 2-way with each other. Updates go to the DR via 224.0.0.**6**; the DR floods to all via 224.0.0.5.",
    "Election: highest **interface priority** wins (default **1**; **0 = never participate**). Tie → highest **router ID**. And critically: **no preemption** — a later router with better credentials waits until the current DR dies.",
    "Point-to-point networks skip the whole thing — no DR/BDR needed with only two routers."
  ],
  k: [
    "Priority default 1; 0 removes the router from election",
    "Tiebreaker: highest RID",
    "No preemption — boot order matters",
    "P2P links elect no DR"
  ],
  cmd: ["interface g0/0", " ip ospf priority 100", "show ip ospf interface g0/0", "show ip ospf neighbor"],
  q: [
    { q: "An interface with OSPF priority 0 will:", o: ["Always be DR", "Never become DR or BDR", "Break adjacency", "Use RID instead"], a: 1, e: "Priority 0 opts out of the election entirely." },
    { q: "A new router with priority 255 joins a segment with an existing DR. It becomes:", o: ["DR immediately", "BDR immediately", "A DROther until the DR/BDR fail", "Err-disabled"], a: 2, e: "No preemption — it waits its turn." },
    { q: "Seeing a neighbor stuck in 2-way on Ethernet usually means:", o: ["MTU mismatch", "Both are DROthers — expected", "Authentication failed", "Area mismatch"], a: 1, e: "DROthers only reach full with the DR and BDR." }
  ]
},
{ id: 36, d: "ip", t: "OSPF IV: Cost, Tuning & Verification", min: 6,
  c: [
    "Cost per interface = **reference bandwidth ÷ interface bandwidth**, default reference **100 Mbps**. So FastEthernet = 1... and GigE also = 1 (minimum is 1). Fix it fleet-wide with `auto-cost reference-bandwidth 100000` (values in Mbps → 100 Gbps reference) **on every router**.",
    "Direct control: `ip ospf cost 50` on an interface beats formulas. Path cost is the **sum of outgoing interface costs** toward the destination.",
    "Verification flow: `show ip ospf neighbor` (adjacencies + states), `show ip ospf interface` (cost, priority, timers, DR), `show ip route ospf` (what actually installed), `show ip protocols` (RID, networks, passive interfaces)."
  ],
  k: [
    "Default reference 100 Mbps makes FE and GigE equal — tune it",
    "Change reference bandwidth everywhere or metrics disagree",
    "ip ospf cost overrides the calculation",
    "Neighbor stuck in exstart/exchange → check MTU"
  ],
  cmd: ["auto-cost reference-bandwidth 100000", "interface g0/1", " ip ospf cost 50", "show ip ospf interface brief", "show ip route ospf"],
  q: [
    { q: "With default settings, the OSPF cost of a 1 Gbps interface is:", o: ["1", "4", "10", "100"], a: 0, e: "100 Mbps reference / 1000 Mbps rounds up to the minimum of 1." },
    { q: "auto-cost reference-bandwidth should be changed:", o: ["Only on the DR", "On every router in the domain", "Only on ABRs", "Never"], a: 1, e: "Consistent references keep cost comparisons meaningful." },
    { q: "Which command shows OSPF interface cost and DR status?", o: ["show ip route", "show ip ospf interface", "show cdp neighbors", "show ip nat translations"], a: 1, e: "Per-interface OSPF details live there." }
  ]
},
{ id: 37, d: "ip", t: "First Hop Redundancy: HSRP, VRRP, GLBP", min: 6,
  c: [
    "Hosts point at one gateway IP; if that router dies, the subnet is stranded. FHRPs fix it with a **virtual IP + virtual MAC** shared by two or more routers.",
    "**HSRP** (Cisco): one **active** router forwards, one **standby** waits; hellos every 3 s to 224.0.0.2, hold 10 s; virtual MAC `0000.0c07.acXX` (XX = group in hex). **VRRP** (open standard): master/backup, preemption on by default. **GLBP** (Cisco) actually **load-balances** — an AVG hands out different virtual MACs so multiple routers forward simultaneously.",
    "The exam angle: pick the protocol from the description, know HSRP's states (active/standby/listen) and that virtual MAC pattern."
  ],
  k: [
    "Hosts use the virtual IP as their gateway — never a real router IP",
    "HSRP active/standby · VRRP master/backup · GLBP load-balances",
    "HSRP vMAC: 0000.0c07.acXX",
    "VRRP is the vendor-neutral choice"
  ],
  q: [
    { q: "Which FHRP provides gateway load balancing across routers?", o: ["HSRP", "VRRP", "GLBP", "STP"], a: 2, e: "GLBP's AVG distributes virtual MACs among forwarders." },
    { q: "In HSRP, the forwarding router is called:", o: ["Master", "Primary", "Active", "Root"], a: 2, e: "Active forwards; standby takes over on failure." },
    { q: "The MAC 0000.0c07.ac0a belongs to:", o: ["A VRRP master", "HSRP group 10", "GLBP AVG", "A real interface"], a: 1, e: "0x0a = 10; that's the HSRP v1 virtual MAC pattern." }
  ]
},
{ id: 38, d: "ip", t: "HSRP Configuration & Priority", min: 6,
  c: [
    "Per interface: `standby 1 ip 10.1.1.254` sets the group and virtual IP. **Priority** (default **100**, highest wins active) picks the leader; tie → highest interface IP.",
    "**Preemption is OFF by default.** Without `standby 1 preempt`, a recovered high-priority router politely stays standby forever. Enabling preempt on your intended active router is the step everyone forgets — and the exam knows it.",
    "Both routers keep their own real IPs; hosts only ever learn the virtual one. Verify with `show standby brief`: state, priority, preempt flag, active/standby addresses."
  ],
  k: [
    "Default priority 100; higher wins",
    "No preempt = no takeover after recovery",
    "Group number must match on both routers",
    "show standby brief is the verification answer"
  ],
  cmd: ["interface g0/1", " ip address 10.1.1.2 255.255.255.0", " standby 1 ip 10.1.1.254", " standby 1 priority 110", " standby 1 preempt", "show standby brief"],
  q: [
    { q: "R1 (priority 110) reboots; R2 (100) became active. R1 returns but stays standby. Why?", o: ["Priorities reset", "R1 lacks 'standby 1 preempt'", "Wrong virtual MAC", "HSRP forbids takeover"], a: 1, e: "Preemption is disabled by default; without it R1 waits." },
    { q: "Hosts on an HSRP subnet should use which default gateway?", o: ["The active router's real IP", "The standby's real IP", "The virtual IP", "Either real IP"], a: 2, e: "The virtual IP survives router failures — that's the point." },
    { q: "Default HSRP priority is:", o: ["1", "100", "110", "32768"], a: 1, e: "100. Raise it (e.g., 110) on the router you want active." }
  ]
},
{ id: 39, d: "ip", t: "Connectivity Troubleshooting Method", min: 6,
  c: [
    "**Ping** tests L3 reachability (ICMP echo/echo-reply); **traceroute** maps the path by walking TTL values — the first hop that stops responding brackets your failure. Extended ping (`ping` with no args on IOS) lets you set the **source interface**, size, and count — vital for testing return paths.",
    "A repeatable flow: (1) ping the loopback/self, (2) ping the default gateway, (3) ping a far-side IP, (4) ping by **name** — separating routing failures from **DNS** failures. You already run this play on desk tickets.",
    "IOS ping punctuation: `!` reply, `.` timeout, `U` destination unreachable. First ping often drops one `.` to ARP. And remember firewalls eat ICMP — no reply proves less than a reply does."
  ],
  k: [
    "Traceroute uses incrementing TTLs to expose each hop",
    "Ping by IP works but name fails = DNS problem",
    "Extended ping can source from any interface",
    "! = success, . = timeout, U = unreachable"
  ],
  cmd: ["ping 10.2.2.2 source g0/1", "traceroute 8.8.8.8", "show ip interface brief", "show arp"],
  q: [
    { q: "Pinging 8.8.8.8 works but pinging google.com fails. The issue is:", o: ["Routing", "DNS resolution", "The default gateway", "Duplex"], a: 1, e: "IP-level reachability is fine; name resolution is broken." },
    { q: "Traceroute discovers the path using:", o: ["ARP floods", "Incrementing TTL values", "SNMP polls", "CDP"], a: 1, e: "Each TTL expiry makes a hop reveal itself." },
    { q: "In IOS ping output, a period (.) means:", o: ["Success", "Timeout waiting for a reply", "TTL expired", "Redirect received"], a: 1, e: "Dots are timeouts; bangs are replies." }
  ]
},
{ id: 40, d: "svc", t: "NAT Concepts & Terminology", min: 6,
  c: [
    "NAT translates private RFC 1918 addresses to routable public ones at your edge — conserving IPv4 and hiding internal numbering.",
    "The four terms (learn them as a grid): **inside local** = the private address of your host as seen inside; **inside global** = the public address representing that host outside; **outside global** = the real address of the external host; **outside local** = how that external host appears inside (usually identical).",
    "Flavors: **static NAT** (one-to-one, permanent — for servers), **dynamic NAT** (pool, first-come), and **PAT/overload** (many-to-one using port numbers — what your home router and most offices run)."
  ],
  k: [
    "Inside local = private; inside global = its public face",
    "Static 1:1, dynamic pool, PAT many:1 via ports",
    "PAT is why thousands of hosts share one public IP",
    "NAT usually happens at the internet edge router/firewall"
  ],
  q: [
    { q: "Your PC 192.168.1.50 appears online as 203.0.113.7. The 203.0.113.7 address is the:", o: ["Inside local", "Inside global", "Outside local", "Outside global"], a: 1, e: "Public representation of an inside host = inside global." },
    { q: "Which NAT type lets hundreds of hosts share one public IP?", o: ["Static NAT", "Dynamic NAT", "PAT (overload)", "NAT64"], a: 2, e: "PAT multiplexes connections using unique port numbers." },
    { q: "Best NAT choice for a web server that must be reachable at a fixed public IP:", o: ["PAT", "Static NAT", "Dynamic NAT", "No NAT possible"], a: 1, e: "Static NAT keeps a permanent one-to-one mapping." }
  ]
},
{ id: 41, d: "svc", t: "Configuring Static NAT & PAT", min: 7,
  c: [
    "Every NAT config starts with role-marking interfaces: `ip nat inside` on the LAN side, `ip nat outside` on the WAN side. Forget one and nothing translates — the #1 NAT bug.",
    "**Static:** `ip nat inside source static 192.168.1.10 203.0.113.10`. **PAT with the outside interface:** build an ACL matching inside hosts, then `ip nat inside source list 1 interface g0/0 overload`. The `overload` keyword is what makes it PAT.",
    "Verify with `show ip nat translations` (look for port numbers on PAT entries) and `show ip nat statistics`. `clear ip nat translation *` resets the table when testing."
  ],
  k: [
    "Mark ip nat inside AND outside — always check this first",
    "overload keyword = PAT",
    "The ACL defines who gets translated",
    "Translations table shows inside local ↔ inside global pairs"
  ],
  cmd: ["interface g0/1", " ip nat inside", "interface g0/0", " ip nat outside", "access-list 1 permit 192.168.1.0 0.0.0.255", "ip nat inside source list 1 interface g0/0 overload", "show ip nat translations"],
  q: [
    { q: "Which keyword turns dynamic NAT into PAT?", o: ["static", "pool", "overload", "extended"], a: 2, e: "overload enables port-based many-to-one translation." },
    { q: "Hosts match the ACL but nothing translates. Most likely cause:", o: ["ACL is too long", "inside/outside not set on interfaces", "MTU too small", "OSPF is down"], a: 1, e: "Without ip nat inside/outside role marking, NAT never triggers." },
    { q: "The access-list in a PAT config identifies:", o: ["The public pool", "Traffic/hosts allowed to be translated", "Blocked websites", "The DNS server"], a: 1, e: "It selects which inside sources NAT will translate." }
  ]
},
{ id: 42, d: "svc", t: "DHCP: DORA, Server & Relay", min: 7,
  c: [
    "The lease dance is **DORA**: client broadcasts **Discover**, server unicasts/broadcasts an **Offer**, client broadcasts a **Request** (accepting one offer), server confirms with an **Ack**. Client side of the exchange starts from 0.0.0.0 toward 255.255.255.255 on UDP 67/68.",
    "IOS as the server: exclude your static addresses first, then build a pool with network, default-router, dns-server, lease.",
    "Routers don't forward broadcasts — so a central DHCP server needs **`ip helper-address <server>`** on each client-facing interface, converting the broadcast Discover into a unicast. That command is the answer to every 'remote subnet can't get a lease' question (and half your APIPA tickets)."
  ],
  k: [
    "Discover, Offer, Request, Ack — in order",
    "Excluded-address prevents leasing your gateways/printers",
    "ip helper-address goes on the interface facing the clients",
    "show ip dhcp binding lists active leases"
  ],
  cmd: ["ip dhcp excluded-address 10.10.10.1 10.10.10.20", "ip dhcp pool USERS", " network 10.10.10.0 255.255.255.0", " default-router 10.10.10.1", " dns-server 10.1.1.53", "interface g0/2", " ip helper-address 10.1.1.5", "show ip dhcp binding"],
  q: [
    { q: "Correct DHCP message order?", o: ["Offer, Discover, Ack, Request", "Discover, Offer, Request, Ack", "Request, Offer, Discover, Ack", "Discover, Request, Offer, Ack"], a: 1, e: "DORA." },
    { q: "Clients on a remote subnet get APIPA addresses. The router fix is:", o: ["ip dhcp snooping", "ip helper-address on their gateway interface", "A bigger pool", "Enabling CDP"], a: 1, e: "The helper relays their broadcast Discover to the far server." },
    { q: "ip dhcp excluded-address exists to:", o: ["Block rogue servers", "Keep statically assigned IPs out of the pool", "Speed up DORA", "Reserve multicast space"], a: 1, e: "It prevents the server from handing out addresses you use statically." }
  ]
},
{ id: 43, d: "svc", t: "DNS on the Network (+ TFTP/FTP)", min: 5,
  c: [
    "DNS maps names to addresses: **A** records for IPv4, **AAAA** for IPv6, CNAME aliases, MX for mail. Clients query a resolver over UDP 53 (TCP 53 for big responses/zone transfers).",
    "On IOS, DNS settings serve the router itself: `ip name-server 10.1.1.53` lets you ping by hostname; `ip domain-name corp.local` sets the suffix (you'll reuse it for SSH keys); `no ip domain-lookup` stops the infamous typo-triggers-a-60-second-lookup behavior on unconfigured boxes.",
    "File transfer for images/configs: **TFTP** (UDP 69, no auth, dead simple — `copy tftp: flash:`) vs **FTP** (TCP 20/21, credentials). Know which is which and their ports."
  ],
  k: [
    "A = IPv4, AAAA = IPv6",
    "ip name-server enables name resolution on the router",
    "TFTP UDP 69 unauthenticated; FTP TCP 20/21 with login",
    "no ip domain-lookup kills the mistyped-command hang"
  ],
  cmd: ["ip domain-name corp.local", "ip name-server 10.1.1.53", "copy tftp: flash:", "no ip domain-lookup"],
  q: [
    { q: "Which record type returns an IPv6 address?", o: ["A", "AAAA", "MX", "PTR"], a: 1, e: "AAAA = IPv6; A = IPv4." },
    { q: "TFTP differs from FTP in that TFTP:", o: ["Uses TCP 21", "Requires credentials", "Uses UDP 69 with no authentication", "Encrypts transfers"], a: 2, e: "Trivial FTP: connectionless, no login — LAN-only tool." },
    { q: "Which command lets a router resolve hostnames via a server?", o: ["ip dns on", "ip name-server 10.1.1.53", "dns lookup enable", "ip host-lookup"], a: 1, e: "ip name-server points the router at a resolver." }
  ]
},
{ id: 44, d: "svc", t: "NTP: One Clock to Rule Them All", min: 5,
  c: [
    "Wrong clocks wreck log correlation, break certificates, and confuse authentication. **NTP** (UDP 123) syncs everything to a hierarchy measured in **stratum**: 0 = the reference hardware (GPS/atomic), 1 = servers wired to it, each hop away adds one. Lower stratum = better; 16 = unsynchronized.",
    "Client config is one line: `ntp server 10.1.1.123`. A router can also serve time downstream with `ntp master [stratum]`.",
    "Verify with `show ntp status` (look for 'synchronized') and `show ntp associations`. Pair time with `service timestamps log datetime msec` so syslog entries are actually useful."
  ],
  k: [
    "Stratum counts distance from the reference clock",
    "ntp server = be a client; ntp master = be a source",
    "UDP 123",
    "Accurate time is a security control, not a nicety"
  ],
  cmd: ["ntp server 10.1.1.123", "show ntp status", "show ntp associations", "clock set 09:00:00 3 July 2026"],
  q: [
    { q: "A stratum 2 server gets its time from:", o: ["A stratum 3 server", "A stratum 1 server", "Any client", "The BIOS"], a: 1, e: "Each stratum syncs from the level above it." },
    { q: "NTP uses which port?", o: ["UDP 69", "UDP 123", "TCP 123", "UDP 161"], a: 1, e: "NTP = UDP 123." },
    { q: "Why does NTP matter for troubleshooting?", o: ["It speeds up OSPF", "Correlated log timestamps across devices", "It encrypts syslog", "It assigns IPs"], a: 1, e: "Matching clocks let you line up events across the network." }
  ]
},
{ id: 45, d: "svc", t: "Syslog & SNMP: Watching the Network", min: 7,
  c: [
    "**Syslog severities**, 0-7: **emergency, alert, critical, error, warning, notification, informational, debugging**. Mnemonic: Every Awesome Cisco Engineer Will Need Ice-cream Daily. Setting `logging trap 4` sends level 4 **and everything more severe** (0-4) to the server (UDP 514).",
    "Message anatomy: `%LINK-3-UPDOWN` = facility-severity-mnemonic. Console logging is on by default; use `terminal monitor` to see logs in an SSH session.",
    "**SNMP**: a manager polls **agents** for **MIB** values (OIDs) on UDP 161; agents push **traps** (unacknowledged) or **informs** (acknowledged) to 162. **v2c** uses plaintext community strings (RO/RW); **v3** adds real authentication + encryption (authPriv) — the only version you should deploy new."
  ],
  k: [
    "0 emergency → 7 debugging; lower number = worse",
    "logging trap N includes all levels ≤ N",
    "Trap = fire-and-forget; inform = acknowledged",
    "SNMPv3 authPriv = authentication + privacy (encryption)"
  ],
  cmd: ["logging host 10.1.1.50", "logging trap warning", "service timestamps log datetime msec", "show logging", "snmp-server community LABRO ro"],
  q: [
    { q: "Severity level 2 is:", o: ["Warning", "Critical", "Informational", "Alert"], a: 1, e: "0 emerg, 1 alert, 2 critical, 3 error, 4 warning..." },
    { q: "logging trap 3 sends which levels to the syslog server?", o: ["Only 3", "3 through 7", "0 through 3", "Nothing"], a: 2, e: "The set level plus everything more severe." },
    { q: "Which SNMP version provides encryption?", o: ["v1", "v2c", "v3", "None"], a: 2, e: "v3 authPriv authenticates and encrypts; v1/v2c are plaintext." }
  ]
},
{ id: 46, d: "svc", t: "Configuring SSH (and Killing Telnet)", min: 6,
  c: [
    "Telnet ships every keystroke in cleartext — anyone with Wireshark reads your enable password. SSH (TCP 22) encrypts the session, and configuring it is a rite of passage.",
    "The recipe, in order: (1) `hostname R1`, (2) `ip domain-name corp.local` — both required because (3) `crypto key generate rsa` names the keypair from them; choose **2048** bits. (4) `username brandon secret Str0ng!`, (5) on `line vty 0 4`: `transport input ssh` + `login local`. (6) `ip ssh version 2`.",
    "`transport input ssh` is what actually blocks Telnet. Verify with `show ip ssh` and a test login. Same playbook secures switches — give them an SVI IP and default gateway first."
  ],
  k: [
    "Hostname + domain-name BEFORE generating keys",
    "RSA 2048; version 2 only",
    "login local = use the local username database",
    "transport input ssh disables Telnet on the vty lines"
  ],
  cmd: ["hostname R1", "ip domain-name corp.local", "crypto key generate rsa modulus 2048", "username brandon secret Str0ng!", "line vty 0 4", " transport input ssh", " login local", "ip ssh version 2", "show ip ssh"],
  q: [
    { q: "crypto key generate rsa fails. What's likely missing?", o: ["An enable secret", "hostname and/or ip domain-name", "An ACL", "NTP sync"], a: 1, e: "The key is named from hostname + domain, so both must exist." },
    { q: "Which line-config command permits only SSH connections?", o: ["login ssh", "transport input ssh", "ssh enable", "no telnet"], a: 1, e: "transport input ssh restricts the vty to SSH." },
    { q: "login local on the vty lines means:", o: ["Only console users connect", "Authenticate against local usernames", "No password needed", "RADIUS is required"], a: 1, e: "It checks the router's local username/secret database." }
  ]
},
{ id: 47, d: "svc", t: "QoS Fundamentals", min: 7,
  c: [
    "When links congest, QoS decides who suffers. Pipeline: **classify** traffic → **mark** it (**DSCP** in the IP header at L3, **CoS** in 802.1Q at L2) → treat it per-hop. Voice gets **EF (DSCP 46)**; assured-forwarding (AF) classes cover data tiers. Mark close to the source at the **trust boundary** — typically the IP phone or access switch.",
    "**Queuing**: CBWFQ guarantees bandwidth per class; **LLQ** adds a strict priority queue so voice jumps the line (with a cap so it can't starve everyone). Congestion avoidance (WRED) drops low-priority packets early to keep TCP calm.",
    "**Policing vs shaping**: policing **drops or re-marks** excess (hard ceiling — ISPs police you); shaping **buffers and delays** to smooth flow to a rate (you shape outbound to match the ISP's police rate)."
  ],
  k: [
    "Voice = EF / DSCP 46, low latency + jitter",
    "LLQ = priority queue for real-time traffic",
    "Police drops; shape delays",
    "Trust boundary: where markings start being believed"
  ],
  q: [
    { q: "Which DSCP marking is standard for voice payloads?", o: ["AF21", "CS0", "EF (46)", "BE"], a: 2, e: "Expedited Forwarding, DSCP 46." },
    { q: "The mechanism that buffers excess traffic to smooth it to a target rate is:", o: ["Policing", "Shaping", "Marking", "WRED"], a: 1, e: "Shaping delays; policing drops/re-marks." },
    { q: "LLQ improves voice quality by:", o: ["Compressing audio", "Giving it a strict-priority queue", "Duplicating packets", "Raising its TTL"], a: 1, e: "Priority queuing minimizes latency and jitter for real-time traffic." }
  ]
},
{ id: 48, d: "sec", t: "Security Concepts & the Human Layer", min: 6,
  c: [
    "Vocabulary first: a **vulnerability** is a weakness; an **exploit** is the tool/technique that abuses it; a **threat** is an actor with the potential to do so; a **mitigation** is the control that reduces the risk. The goals are the **CIA triad** — confidentiality, integrity, availability.",
    "Security programs run on people too: **user awareness** (phishing simulations — you've seen these at HII), **training**, and **physical access control** (badges, locks, cameras).",
    "**AuthN vs AuthZ**: proving who you are vs what you may do. **MFA** combines factors — something you **know** (password), **have** (YubiKey/Okta push), **are** (biometric). Two passwords is not MFA; two factors is."
  ],
  k: [
    "Vulnerability ≠ threat ≠ exploit ≠ mitigation — match them precisely",
    "CIA: confidentiality, integrity, availability",
    "MFA = different factor types, not two of the same",
    "Awareness programs are a control, not fluff"
  ],
  q: [
    { q: "An unpatched IOS bug that could be abused is a:", o: ["Threat", "Vulnerability", "Exploit", "Mitigation"], a: 1, e: "The weakness itself is a vulnerability; code that abuses it is an exploit." },
    { q: "A password plus a YubiKey tap is:", o: ["Single-factor", "Two-factor (know + have)", "Two-factor (know + are)", "Not authentication"], a: 1, e: "Knowledge factor + possession factor." },
    { q: "Ensuring data isn't altered in transit protects:", o: ["Confidentiality", "Integrity", "Availability", "Accounting"], a: 1, e: "Integrity = the data arrives unmodified." }
  ]
},
{ id: 49, d: "sec", t: "Common Attacks & Mitigations", min: 7,
  c: [
    "**Spoofing** fakes an identity — MAC, IP, or ARP. **ARP poisoning** puts an attacker's MAC in victims' ARP caches, enabling **man-in-the-middle**. Rogue **DHCP spoofing** hands out a malicious gateway/DNS. (Lessons 54-55 bring the switch-side countermeasures.)",
    "**DoS/DDoS** exhausts resources — the classic **TCP SYN flood** leaves half-open connections; **reflection/amplification** bounces small spoofed queries off servers (DNS/NTP) that reply big to the victim.",
    "Credential attacks: **brute force** and **dictionary**. Social engineering hits people instead: **phishing**, targeted **spear phishing**, exec-focused **whaling**, phone **vishing**, SMS **smishing**, **tailgating** through doors, **watering hole** sites. Mitigations pair controls with training — plus patching and segmentation. You literally caught a ClickFix attempt at home; that instinct is this lesson."
  ],
  k: [
    "ARP poisoning → MITM; countered by DAI",
    "SYN flood = half-open TCP exhaustion",
    "Amplification = small spoofed request, huge reflected reply",
    "Spear phishing targets a person; whaling targets executives"
  ],
  q: [
    { q: "An attacker answers ARP requests with their own MAC for the gateway IP. This is:", o: ["DHCP starvation", "ARP spoofing/poisoning", "SYN flood", "Smishing"], a: 1, e: "Corrupting ARP caches to intercept traffic = ARP poisoning." },
    { q: "A SYN flood exploits:", o: ["DNS recursion", "The TCP three-way handshake", "ICMP redirects", "802.1Q tagging"], a: 1, e: "It opens handshakes it never completes, exhausting the server." },
    { q: "A crafted email tricking one specific finance manager is:", o: ["Phishing", "Spear phishing", "Vishing", "Tailgating"], a: 1, e: "Targeted-at-an-individual phishing = spear phishing." }
  ]
},
{ id: 50, d: "sec", t: "Device Hardening & Passwords", min: 6,
  c: [
    "Privileged mode gets `enable secret` — hashed in the config. The old `enable password` stores plaintext; never use it. `service password-encryption` scrambles remaining line passwords with reversible **type 7** — obfuscation, not security. Prefer `username x secret` / algorithm-type scrypt where available.",
    "Line hygiene: `exec-timeout 5 0` kills idle sessions, console gets `login` + a password (or login local), and a `banner motd` warns off intruders (legal cover — never say 'welcome').",
    "Reduce attack surface: shut unused ports and drop them in an unused VLAN, disable unneeded services (HTTP server), SSH-only management (lesson 46), and keep IOS patched."
  ],
  k: [
    "enable secret = hashed; enable password = plaintext relic",
    "Type 7 encryption is trivially reversible",
    "exec-timeout + banners + shut unused ports",
    "Management plane: SSH only, patched, least exposure"
  ],
  cmd: ["enable secret Str0ngPass!", "service password-encryption", "banner motd #Authorized access only#", "line con 0", " exec-timeout 5 0", "interface range g0/10 - 24", " shutdown"],
  q: [
    { q: "Why prefer enable secret over enable password?", o: ["It's shorter", "It's stored as a hash", "It syncs via VTP", "It enables SSH"], a: 1, e: "Secret is hashed; password sits in cleartext." },
    { q: "service password-encryption applies:", o: ["AES-256", "Weak, reversible type 7 encoding", "SHA-256", "Nothing"], a: 1, e: "Type 7 is deterrence only — crackable in seconds." },
    { q: "A login banner should:", o: ["Welcome users warmly", "State access is restricted to authorized users", "List admin phone numbers", "Show the IOS version"], a: 1, e: "Warning banners support prosecution; 'welcome' undermines it." }
  ]
},
{ id: 51, d: "sec", t: "AAA (TACACS+ vs RADIUS) & VPN Types", min: 7,
  c: [
    "**AAA** = Authentication (who), Authorization (what they may do), Accounting (what they did) — centralized on a server (Cisco ISE) instead of local passwords per box.",
    "The matchup: **TACACS+** — Cisco, **TCP 49**, encrypts the **entire payload**, separates all three A's for **per-command authorization** → the pick for **device administration**. **RADIUS** — open standard, **UDP 1812/1813**, encrypts **only the password**, combines authN+authZ → the pick for **network access** (802.1X, VPN, Wi-Fi).",
    "**VPNs**: **site-to-site IPsec** connects networks gateway-to-gateway (ESP provides encryption + integrity, tunnel mode); **remote-access** VPNs connect individual users via a client (TLS/SSL like AnyConnect, or IPsec). Plain **GRE** tunnels anything but encrypts nothing — hence GRE over IPsec."
  ],
  k: [
    "TACACS+ TCP 49, full encryption, per-command → device admin",
    "RADIUS UDP 1812/1813, password-only encryption → network access",
    "Site-to-site = network↔network; remote access = user→network",
    "GRE has no encryption by itself"
  ],
  q: [
    { q: "For granular per-command authorization on routers, use:", o: ["RADIUS", "TACACS+", "SNMPv3", "Kerberos only"], a: 1, e: "TACACS+ separates authorization and controls commands individually." },
    { q: "RADIUS encrypts:", o: ["The whole packet", "Only the password field", "Nothing", "Only accounting"], a: 1, e: "Password-only — TACACS+ encrypts the full body." },
    { q: "A traveling employee connecting via AnyConnect uses a:", o: ["Site-to-site VPN", "Remote-access VPN", "GRE tunnel", "Leased line"], a: 1, e: "Client-based user connectivity = remote access." }
  ]
},
{ id: 52, d: "sec", t: "Standard ACLs & Wildcard Masks", min: 7,
  c: [
    "ACLs are ordered permit/deny lists processed **top-down, first match wins**, ending in an **implicit deny any**. Standard ACLs (numbers **1-99**, 1300-1999) match **source IP only**.",
    "**Wildcard masks** invert subnet-mask thinking: 0-bit = must match, 1-bit = don't care. A /24 network → wildcard `0.0.0.255`. Shortcuts: `host 10.1.1.5` = 10.1.1.5 0.0.0.0; `any` = 0.0.0.0 255.255.255.255.",
    "Because standards can't see destinations, place them **close to the destination** or you'll block traffic you meant to keep. Apply per interface/direction: `ip access-group 10 in`. One ACL per interface, per direction, per protocol."
  ],
  k: [
    "Top-down, first match, implicit deny at the end",
    "Wildcard = inverse mask; /24 → 0.0.0.255",
    "Standard = source only → place near destination",
    "An empty match falls through to the implicit deny"
  ],
  cmd: ["access-list 10 permit 192.168.1.0 0.0.0.255", "access-list 10 deny host 10.1.1.99", "interface g0/1", " ip access-group 10 in", "show access-lists"],
  q: [
    { q: "The wildcard mask matching exactly 172.16.32.0/20 is:", o: ["0.0.15.255", "0.0.31.255", "0.0.240.255", "255.255.240.0"], a: 0, e: "/20 mask 255.255.240.0 inverts to 0.0.15.255." },
    { q: "Standard ACLs filter on:", o: ["Source and destination", "Source IP only", "Destination port", "MAC address"], a: 1, e: "Source only — which is why they sit near the destination." },
    { q: "Traffic matching no line in an ACL is:", o: ["Permitted", "Denied by the implicit deny", "Logged only", "Queued"], a: 1, e: "Every ACL ends with an invisible deny any." }
  ]
},
{ id: 53, d: "sec", t: "Extended & Named ACLs", min: 7,
  c: [
    "Extended ACLs (**100-199**, 2000-2699) match **protocol, source, destination, and ports** — real firewall-style rules. Example: `access-list 110 permit tcp 10.1.1.0 0.0.0.255 host 10.9.9.80 eq 80` allows that subnet to reach one web server.",
    "Because they're precise, place extended ACLs **close to the source** — kill unwanted traffic before it crosses the network. (Standard near destination, extended near source: exam gold.)",
    "**Named ACLs** (`ip access-list extended BLOCK-TELNET`) are the modern form — readable names and **sequence numbers**, so you can insert/delete single lines instead of rebuilding. Bonus use: `access-class 15 in` on the vty lines restricts who may SSH to the device itself."
  ],
  k: [
    "Extended matches proto + src + dst + ports (eq 22, eq 80...)",
    "Extended near source; standard near destination",
    "Named ACLs allow per-line sequence editing",
    "access-class protects the vty lines"
  ],
  cmd: ["ip access-list extended NO-TELNET", " 10 deny tcp any any eq 23", " 20 permit ip any any", "interface g0/0", " ip access-group NO-TELNET in", "line vty 0 4", " access-class 15 in"],
  q: [
    { q: "Which entry permits only web traffic to host 10.9.9.80?", o: ["permit ip any host 10.9.9.80", "permit tcp any host 10.9.9.80 eq 80", "permit udp any any eq 80", "permit tcp host 10.9.9.80 any eq 80"], a: 1, e: "TCP to that destination, port 80. Direction and protocol matter." },
    { q: "Best placement for an extended ACL?", o: ["Near the destination", "Near the source", "Only on vty lines", "On the root bridge"], a: 1, e: "Precise rules can safely drop traffic at its origin." },
    { q: "The advantage of named ACLs is:", o: ["They skip the implicit deny", "Editable individual lines via sequence numbers", "They work only on switches", "They auto-place themselves"], a: 1, e: "Sequence numbers make surgical edits possible." }
  ]
},
{ id: 54, d: "sec", t: "Port Security: Locking Down Access Ports", min: 6,
  c: [
    "Port security limits which/how many MACs may live on a switchport. Defaults once enabled: **max 1 MAC**, violation **shutdown**. `sticky` learns the current MAC and writes it into the running config.",
    "Violation modes: **shutdown** — port goes **err-disabled** (default); **restrict** — drops offenders, logs, increments counters; **protect** — drops silently. Know the differences cold.",
    "Requirement: the port must be statically `switchport mode access` (or trunk) first — dynamic ports refuse the feature. Recovery from err-disabled: `shutdown` / `no shutdown`, or automate with `errdisable recovery cause psecure-violation`."
  ],
  k: [
    "Defaults: 1 MAC, shutdown violation",
    "shutdown = err-disabled; restrict = drop+log; protect = drop silently",
    "sticky saves learned MACs to the config",
    "Static access mode required before enabling"
  ],
  cmd: ["interface g0/5", " switchport mode access", " switchport port-security", " switchport port-security maximum 2", " switchport port-security mac-address sticky", " switchport port-security violation restrict", "show port-security interface g0/5"],
  q: [
    { q: "Default port-security violation action?", o: ["Protect", "Restrict", "Shutdown", "Log only"], a: 2, e: "Shutdown → the port lands in err-disabled." },
    { q: "Which mode drops violating frames AND generates log/counter entries?", o: ["Protect", "Restrict", "Shutdown", "Sticky"], a: 1, e: "Restrict = drop + syslog + violation counter. Protect is silent." },
    { q: "Port security won't enable on an interface because:", o: ["It's a 10 Gb port", "The port is in dynamic (DTP) mode", "STP is running", "It has an IP"], a: 1, e: "The port must be statically access or trunk first." }
  ]
},
{ id: 55, d: "sec", t: "DHCP Snooping & Dynamic ARP Inspection", min: 7,
  c: [
    "**DHCP snooping** splits ports into **trusted** (toward the real server — uplinks) and **untrusted** (everything else). Untrusted ports may send client messages but any server messages (OFFER/ACK) from them are dropped — rogue DHCP neutralized. You can also rate-limit Discovers to stop starvation attacks.",
    "Side effect that matters: snooping builds the **binding table** — MAC ↔ IP ↔ port ↔ VLAN for every lease it witnesses.",
    "**Dynamic ARP Inspection** consumes that table: on untrusted ports it validates every ARP packet's sender MAC/IP against a binding and drops liars — killing the ARP-poisoning MITM from lesson 49. Enable both per VLAN; trust the same uplinks."
  ],
  k: [
    "Trusted = uplinks/server side; untrusted = access ports",
    "Snooping drops server-role messages on untrusted ports",
    "Binding table: MAC/IP/port/VLAN",
    "DAI validates ARP against the snooping bindings"
  ],
  cmd: ["ip dhcp snooping", "ip dhcp snooping vlan 10", "interface g0/24", " ip dhcp snooping trust", " ip arp inspection trust", "ip arp inspection vlan 10", "show ip dhcp snooping binding"],
  q: [
    { q: "A DHCP OFFER arriving on an untrusted port is:", o: ["Forwarded", "Dropped", "Tagged", "Rate-limited only"], a: 1, e: "Server messages from untrusted ports = rogue server, dropped." },
    { q: "DAI checks ARP packets against:", o: ["The MAC address table", "The DHCP snooping binding table", "The routing table", "CDP data"], a: 1, e: "Bindings prove which IP belongs to which MAC/port." },
    { q: "Which ports should be DHCP-snooping trusted?", o: ["All access ports", "Uplinks toward the legitimate DHCP server", "Only wireless ports", "None"], a: 1, e: "Trust the path to the real server; distrust the edge." }
  ]
},
{ id: 56, d: "sec", t: "Wireless Security: WPA2, WPA3 & 802.1X", min: 6,
  c: [
    "Evolution: WEP (broken) → WPA/TKIP (legacy) → **WPA2** with **AES-CCMP** and the 4-way handshake → **WPA3** with **SAE** (Simultaneous Authentication of Equals), which resists offline dictionary attacks, adds forward secrecy, and uses GCMP + protected management frames.",
    "Two deployment modes: **Personal** = pre-shared key (PSK) — fine for home; **Enterprise** = **802.1X/EAP** with a RADIUS server — per-user credentials, the corporate answer (this is where lesson 51's RADIUS shows up).",
    "On a WLC WLAN you select the L2 security: WPA2/WPA3, PSK vs 802.1X. Open + captive portal covers guest. Never deploy WEP or WPS; hide-the-SSID is not security."
  ],
  k: [
    "WPA2 = AES-CCMP; WPA3 = SAE + GCMP + PMF",
    "SAE defeats offline dictionary attacks on the handshake",
    "Personal = PSK; Enterprise = 802.1X + RADIUS",
    "EAP is the authentication framework inside 802.1X"
  ],
  q: [
    { q: "WPA3-Personal replaces the PSK handshake with:", o: ["TKIP", "SAE", "WEP+", "LEAP"], a: 1, e: "Simultaneous Authentication of Equals hardens key establishment." },
    { q: "WPA2-Enterprise authenticates users via:", o: ["A shared passphrase", "802.1X with a RADIUS server", "MAC filtering", "Hidden SSIDs"], a: 1, e: "Per-user EAP credentials checked against RADIUS." },
    { q: "The encryption protocol of WPA2 is:", o: ["TKIP", "AES-CCMP", "DES", "RC4"], a: 1, e: "CCMP (AES-based) replaced TKIP/RC4." }
  ]
},
{ id: 57, d: "auto", t: "SDN & Controller-Based Networking", min: 7,
  c: [
    "Split a device's brain into planes: **data plane** forwards frames/packets; **control plane** decides (routing protocols, ARP, STP); **management plane** is how you administer (SSH/SNMP). Traditional networks distribute the control plane across every box.",
    "**SDN** centralizes control in a **controller**. Talking upward to apps/scripts: the **northbound interface** (REST APIs). Talking down to devices: the **southbound interface** (NETCONF, RESTCONF, OpenFlow, or plain SSH).",
    "**Cisco Catalyst (DNA) Center** manages campus fabrics with intent-based networking — you declare policy, it programs devices — versus box-by-box CLI. Overlay/underlay vocabulary: the physical routed **underlay** carries a virtual **overlay** (VXLAN tunnels) in SD-Access. AI/ML features now assist with baselining, anomaly detection, and predictive remediation — new blueprint territory."
  ],
  k: [
    "Data = forward, control = decide, management = administer",
    "Northbound: controller ↔ apps; southbound: controller ↔ devices",
    "Controller-based = centralized policy, less per-box CLI",
    "Overlay (VXLAN) rides the physical underlay"
  ],
  q: [
    { q: "Which plane actually forwards user traffic?", o: ["Control", "Data", "Management", "Northbound"], a: 1, e: "The data (forwarding) plane moves packets; control decides paths." },
    { q: "A Python script calls the controller's REST API. It's using the:", o: ["Southbound interface", "Northbound interface", "Console", "Data plane"], a: 1, e: "Apps talk to controllers via the NBI." },
    { q: "In SD-Access, VXLAN builds the:", o: ["Underlay", "Overlay", "Management VRF", "Trunk"], a: 1, e: "The overlay tunnels ride the routed underlay." }
  ]
},
{ id: 58, d: "auto", t: "REST APIs & Reading JSON", min: 7,
  c: [
    "REST APIs move network automation over HTTP. **Verbs map to CRUD**: POST = create, GET = read, PUT/PATCH = update, DELETE = delete. Calls are **stateless** — every request carries its own authentication (API key/token in headers).",
    "Status codes: **2xx** success (200 OK, 201 created, 204 no content), **4xx** you messed up (**400** bad request, **401** unauthenticated, **403** forbidden, **404** not found), **5xx** the server did.",
    "Payloads are **JSON**: objects `{ }` hold key:value pairs, arrays `[ ]` hold ordered lists; keys and strings use **double quotes**; numbers, true/false, null go bare. In `{\"vlans\": [{\"id\": 10, \"name\": \"USERS\"}]}` — vlans is an array of objects; the first object's id is the number 10. The exam will make you read exactly that."
  ],
  k: [
    "GET read, POST create, PUT/PATCH update, DELETE delete",
    "401 = bad/missing auth; 404 = no such resource",
    "JSON: {} object, [] array, keys in double quotes",
    "REST is stateless — auth on every call"
  ],
  q: [
    { q: "Which HTTP verb retrieves data without changing it?", o: ["POST", "GET", "PUT", "DELETE"], a: 1, e: "GET = read; it's the safe, idempotent verb." },
    { q: "A 403 response means:", o: ["Resource missing", "Authenticated but not allowed", "Server crashed", "Created successfully"], a: 1, e: "403 forbidden — valid identity, insufficient rights (401 = not authenticated)." },
    { q: "In {\"device\": {\"ports\": [1, 2, 3]}}, 'ports' is:", o: ["An object", "An array of numbers", "A string", "Invalid JSON"], a: 1, e: "Square brackets = array; its members are numbers." }
  ]
},
{ id: 59, d: "auto", t: "Configuration Management: Ansible, Terraform & Friends", min: 6,
  c: [
    "Hand-typing configs across 200 switches invites drift. Config-management tools push a **single source of truth**: consistent, version-controlled, repeatable.",
    "The lineup: **Ansible** — **agentless**, connects over SSH, **pushes** YAML **playbooks** against an inventory. **Puppet** — agent on the device **pulls** *manifests* from a server. **Chef** — agent pulls *recipes/cookbooks*. **Terraform** — **declarative infrastructure-as-code** (HCL): you describe the end state, it plans and applies via provider APIs, tracking a state file.",
    "Exam mapping is mostly vocabulary: agentless+push+playbook = Ansible; manifest = Puppet; recipe = Chef; declarative IaC + plan/apply = Terraform."
  ],
  k: [
    "Ansible: agentless, SSH, push, YAML playbooks",
    "Puppet manifests / Chef recipes: agent-based pull",
    "Terraform: declarative, provider APIs, state file",
    "Benefits: consistency, versioning, speed, less human error"
  ],
  q: [
    { q: "Which tool is agentless and pushes YAML playbooks over SSH?", o: ["Puppet", "Chef", "Ansible", "Terraform"], a: 2, e: "Ansible needs no agent — SSH plus playbooks." },
    { q: "'Manifests' belong to:", o: ["Ansible", "Puppet", "Chef", "Terraform"], a: 1, e: "Puppet manifests; Chef uses recipes; Ansible uses playbooks." },
    { q: "Declaring desired end-state infrastructure that a tool plans and applies describes:", o: ["Imperative scripting", "Declarative IaC (Terraform)", "SNMP polling", "Manual CLI"], a: 1, e: "Terraform's declarative model: define the goal, it computes the changes." }
  ]
},
{ id: 60, d: "auto", t: "Day 60: Exam Strategy & Launch Plan", min: 8,
  c: [
    "You made it through the whole blueprint. The **CCNA 200-301** exam: ~120 minutes, roughly 100+ questions — multiple choice, drag-and-drop, and lab simlets. **No going back** to previous questions, so answer everything; an educated guess beats a blank. Booked through Pearson VUE (testing center or OnVUE at home), around $300.",
    "Final two weeks: hammer this app's Review tab until nothing is due, lab weak spots in **Packet Tracer** or CML (OSPF, ACLs, NAT, port security are the big sim candidates), and take timed practice exams (Boson ExSim is the gold standard) to build pacing — about a minute per question.",
    "Exam-day tactics: read the **last line of the question first**, eliminate two answers before choosing, trust the AD table and port numbers you drilled, and flag nothing mentally — commit and move. This cert plus your desk experience at Bell Techlogix is a real resume weapon on the road to those Azure certs. Go book it."
  ],
  k: [
    "~120 min, no backtracking — never leave blanks",
    "Sims to lab: OSPF, ACL, NAT, VLANs/trunks, port security",
    "Practice exams for pacing: ~1 minute per question",
    "Keep the Review tab alive until exam day"
  ],
  q: [
    { q: "You're unsure on question 40. Best move?", o: ["Skip it and return later", "Answer with your best elimination guess and move on", "Spend 10 minutes", "Leave it blank"], a: 1, e: "No backtracking on the CCNA — commit and keep pace." },
    { q: "The highest-value final-week activity is:", o: ["Reading new material", "Timed practice exams + labbing weak areas", "Memorizing MAC OUIs", "Skipping review"], a: 1, e: "Pacing and hands-on weak-spot repair beat new content." },
    { q: "Roughly how much time per question should you budget?", o: ["3 minutes", "About 1 minute", "10 seconds", "5 minutes"], a: 1, e: "~120 minutes across 100+ questions ≈ one minute each." }
  ]
}
];

/* v3: plain-English intros + real-world examples, merged into every lesson */
const EXTRAS = {
1:{eli:"The OSI model is a 7-layer game engine stack — the graphics layer doesn't care how the netcode works; each layer does its one job and hands off.",use:"User says 'internet's down' — you walk the layers: cable in (L1) → link light (L2) → has an IP (L3) → app loads (L7). That's the whole method."},
2:{eli:"Sending data is nesting boxes: your message goes in a TCP envelope, inside an IP box, inside an Ethernet crate. The other side unboxes in reverse.",use:"Open Wireshark and you're literally looking at the boxes: frame → packet → segment → data."},
3:{eli:"TCP is certified mail — tracked, and resent if lost. UDP is a Snap — fast, no receipt, gone if it drops.",use:"Game voice chat never 'retries' a laggy word (UDP); a file download always arrives complete (TCP)."},
4:{eli:"The IP address gets you to the building; the port number is the apartment door. 443 is the HTTPS apartment.",use:"Any 'app can't reach server' ticket starts with the same question: which port, and is it TCP or UDP?"},
5:{eli:"A switch is a mailroom clerk who memorizes which desk each name (MAC) sits at — so it stops shouting to everyone and starts delivering.",use:"show mac address-table tells you exactly which port a device lives on — how you physically hunt down a machine."},
6:{eli:"Private IPs (10.x, 172.16–31.x, 192.168.x) are apartment numbers — every building can reuse them because they never appear on public streets.",use:"See 169.254.x.x on a PC? That's APIPA screaming 'I never reached DHCP' — check the cable and port first."},
7:{eli:"The subnet mask is a cookie cutter: it slices one big network into equal-size neighborhoods.",use:"Two devices can't talk but both ping the gateway? A wrong mask may have put them in different neighborhoods."},
8:{eli:"Block size is the cheat code: 256 minus the interesting mask octet tells you where every subnet starts.",use:"Ticket shows 172.16.50.99/27 — block 32, so subnet .96, broadcast .127. You do it in your head."},
9:{eli:"VLSM is Tetris for address space — the 100-host LAN gets a big piece, the 2-router link gets a tiny /30, nothing is wasted.",use:"Real IP plans give point-to-point links /30s or /31s almost every time — now you know why."},
10:{eli:"IPv6 addresses stop being scary with two shortcuts: drop leading zeros, and squash one run of all-zero groups into ::.",use:"You'll shorten 2001:0db8:0000:0000:0000:0000:0000:0001 to 2001:db8::1 on every exam question that shows one."},
11:{eli:"SLAAC means a device builds its own address from the router's prefix — like generating a gamertag from the server name, no signup desk needed.",use:"Every IPv6 interface auto-creates a fe80:: link-local — spotting one proves IPv6 is alive with zero config."},
12:{eli:"A two-tier campus is hub-and-spoke: access switches (spokes) all feed into distribution/core (the hub).",use:"When 'the whole floor is down,' knowing which access switch feeds it tells you the blast radius instantly."},
13:{eli:"VMs are multiple game saves running on one console; VRFs are separate routing tables — parallel universes inside one router.",use:"'The server is slow' at work usually means one VM on a shared host — ask which VM, which host."},
14:{eli:"A duplex mismatch is two walkie-talkies where one side thinks it's a phone call — it talks over everything and causes collisions.",use:"Port that works but crawls, with CRC/late-collision counters climbing in show interfaces = cable or duplex. Classic."},
15:{eli:"2.4 GHz channels overlap like neighbors shouting through thin walls — 1, 6, and 11 are the only three rooms that don't share a wall.",use:"'Wi-Fi is slow near the breakroom' → check what channels the nearby APs are on. Overlap = interference."},
16:{eli:"VLANs draw invisible walls inside one switch — Accounting and Guest can share the hardware but live in separate buildings.",use:"'New PC has no network' is very often just a port left in the wrong VLAN. show vlan brief before anything fancy."},
17:{eli:"A trunk is the highway between switches; every frame wears a VLAN sticker (802.1Q tag) so the far end knows its lane.",use:"VLAN works on one switch but not its neighbor? Check the trunk's allowed-VLAN list — it may be pruned off."},
18:{eli:"DTP is switches auto-negotiating handshakes you never asked for. Pros turn it off and set every port's job by hand.",use:"Hardening checklist: switchport nonegotiate + manual access/trunk modes. Auto anything is attack surface."},
19:{eli:"VLAN walls need doors — a router interface or SVI is the doorway that lets VLAN 10 visit VLAN 20.",use:"PC pings its own VLAN but nothing else → that VLAN's gateway (SVI) is missing or down. show ip int brief."},
20:{eli:"STP elects one king switch, then blocks any hallway that would let traffic run in circles forever.",use:"Network melts down right after someone added a switch? Loop or surprise root election — show spanning-tree first."},
21:{eli:"Normal ports sit at a red light ~30 seconds before forwarding; PortFast gives PC-facing ports an instant green.",use:"'No IP for 30 seconds after plugging in' = missing PortFast — DHCP times out while the port waits at the light."},
22:{eli:"RSTP is classic STP with a sports-car engine — same rules, but convergence happens in a blink instead of half a minute.",use:"Cisco defaults to rapid-pvst (one tree per VLAN) — it's what show spanning-tree will actually show you at work."},
23:{eli:"EtherChannel duct-tapes 2–8 links into one fat pipe — more bandwidth, and STP sees one road so it blocks nothing.",use:"Production switch uplinks are almost always Po1/Po2 bundles — show etherchannel summary when an uplink acts weird."},
24:{eli:"CDP is switches introducing themselves to neighbors — 'Hi, I'm SW2, you're on my Gi0/1' — a self-drawing network map.",use:"Mystery wall jack? show cdp neighbors on the phone or switch reveals the far-end switch and exact port."},
25:{eli:"Lightweight APs are drones; the WLC is mission control flying all of them through CAPWAP tunnels.",use:"One AP acting up = local/RF problem. ALL APs acting up = controller problem. That split picks your path."},
26:{eli:"A WLAN on the controller is a recipe card: SSID + security type + which interface/VLAN clients land on.",use:"'Guest Wi-Fi puts people on the wrong subnet' → the WLAN is mapped to the wrong dynamic interface."},
27:{eli:"The routing table is the router's GPS — every destination gets a next hop, and the codes (C, S, O) say who provided the directions.",use:"Every 'can't reach X' ticket eventually lands at show ip route: is there a path at all, and who taught it?"},
28:{eli:"When several routes match, the most specific wins — 'Main St, Springfield' beats directions that just say 'Springfield.'",use:"Traffic taking a weird path usually means a longer, more-specific prefix is hijacking it. Hunt that route."},
29:{eli:"A default route is the door marked EVERYTHING ELSE — when in doubt, send it there (usually toward the internet).",use:"Branch routers and home labs run on one line: ip route 0.0.0.0 0.0.0.0 <ISP>. That's the internet switch."},
30:{eli:"A floating static is the understudy — its worse AD keeps it backstage until the star route dies.",use:"Primary fiber + LTE backup = same route entered twice, the backup with AD 250, waiting silently for failover."},
31:{eli:"AD is the router's trust ranking for gossip: its own eyes (connected, 0), your word (static, 1), a coworker (OSPF, 110).",use:"Wrong route winning? Compare ADs — a forgotten static (AD 1) silently beats anything OSPF learned."},
32:{eli:"Routing protocols are routers in a group chat, constantly sharing who can reach what so nobody hand-types the map.",use:"At CCNA level, OSPF is the one you configure and troubleshoot — know the family tree for the exam."},
33:{eli:"OSPF routers run a lobby checklist before becoming friends — area, timers, and subnet must match or no adjacency.",use:"Neighbors stuck? It's nearly always mismatched area/timers/subnet or a passive interface. Same checklist every time."},
34:{eli:"network 10.0.0.0 0.0.0.255 area 0 just means: any interface in this range, start speaking OSPF in area 0.",use:"Every OSPF lab: router ospf 1, network statements, passive-interface on ports facing users. Muscle memory."},
35:{eli:"On a shared LAN, OSPF elects a class president (DR) so everyone reports to one router instead of everyone-to-everyone chaos.",use:"FULL/DROTHER in show ip ospf neighbor on Ethernet is normal hierarchy, not a problem."},
36:{eli:"OSPF picks paths by total cost (reference bandwidth ÷ link speed) — one highway beats three back roads.",use:"Traffic ignoring your 10G link? Every fast link costs 1 by default — raise auto-cost reference-bandwidth."},
37:{eli:"HSRP gives two routers one shared phone number (virtual IP) — if the active router dies, standby answers the same number.",use:"Users never touch their gateway setting; failover is invisible. MAC 0000.0c07.acXX in a capture = HSRP fingerprint."},
38:{eli:"Priority picks the starter (higher wins) — but without preempt, a recovered router politely stays on the bench.",use:"'I set the primary but it's stuck standby' — you forgot standby preempt. The #1 HSRP gotcha."},
39:{eli:"Ping asks 'you alive?' — traceroute drops breadcrumbs at every router so you see exactly where the path dies.",use:"Desk triage 101: ping the gateway → ping 8.8.8.8 → ping by name. Where it breaks tells you what broke."},
40:{eli:"Inside local vs inside global = your name at home vs your gamertag online — same player, translated at the door.",use:"Reading show ip nat translations: left side is the private address, right side is what the internet sees."},
41:{eli:"PAT is the whole LAN sharing one public IP, told apart by port numbers — one street address, thousands of numbered mailboxes.",use:"Your home router does PAT right now. ip nat inside source list 1 interface g0/0 overload is the same trick on IOS."},
42:{eli:"DHCP is a four-line drive-thru: Discover, Offer, Request, ACK — pull up, get handed an IP meal.",use:"PC on 169.254? ipconfig /renew fixing it = DHCP hiccup. Server on another VLAN? That's ip helper-address."},
43:{eli:"DNS is the internet's contacts app — you tap a name, it dials the number.",use:"'Site is down' but ping 8.8.8.8 works and ping google.com fails? That's DNS, not the network. Case closed."},
44:{eli:"NTP syncs every device's watch to one boss clock; stratum counts how many hops you are from the atomic source.",use:"Logs across devices only line up if clocks agree — without NTP, your troubleshooting timeline is fiction."},
45:{eli:"Syslog is devices journaling their feelings (0 = dying, 7 = oversharing); SNMP is the monitoring system taking their vitals.",use:"%LINK-3-UPDOWN reads facility-severity-mnemonic. You'll skim hundreds of these; the 3 means 'error.'"},
46:{eli:"Telnet is a postcard anyone can read in transit; SSH is the same conversation in a sealed armored envelope.",use:"The 6-step SSH recipe (hostname → domain → keys → user → vty → v2) is both a lab task and a real hardening ticket."},
47:{eli:"QoS is the VIP line at a club — voice packets skip the queue because a laggy call is ruined, a slow download isn't.",use:"Choppy Teams/desk-phone audio on a busy link = voice isn't marked EF or the trust boundary is wrong."},
48:{eli:"Vulnerability = unlocked window. Exploit = the crowbar. Threat = the burglar. Mitigation = the alarm system.",use:"Every incident writeup sorts facts into exactly those four buckets, plus which of C-I-A got hit."},
49:{eli:"ARP poisoning is someone slapping their name on your mailbox so all your mail quietly routes through them first.",use:"That ClickFix you caught? Social engineering. Phishing, vishing, smishing = the email, phone, and SMS flavors."},
50:{eli:"enable secret locks the admin password in a hash; the old enable password leaves it on a sticky note in the config.",use:"Real audit findings look like this lesson: type 7 passwords, no exec-timeout, live unused ports. It's the fix list."},
51:{eli:"TACACS+ is the Cisco butler who logs every command you run; RADIUS is the open-standard bouncer checking IDs at the door.",use:"Your Okta/Duo world is AAA thinking. Device admin at scale → TACACS+. Wi-Fi 802.1X → RADIUS."},
52:{eli:"An ACL is a bouncer with a top-down guest list — the first matching line decides, and the list ends with 'everyone else: NO.'",use:"Wildcard trick you'll use forever: 255.255.255.255 minus the mask. A /24 becomes 0.0.0.255."},
53:{eli:"Extended ACLs read the whole story — who, to whom, which app — so they sit right at the source, like airport security before the flight.",use:"'Block Telnet, allow SSH' = one named extended ACL: deny tcp any any eq 23 above a permit. Ten-second ticket."},
54:{eli:"Port security is a bouncer who memorizes the first face (MAC) at the door and slams it on strangers.",use:"Port died after someone swapped devices? err-disabled from a violation. Verify, then shut / no shut. Classic desk fix."},
55:{eli:"DHCP snooping only believes 'I'm the DHCP server!' if it walks in through the trusted staff entrance (the uplink).",use:"Someone plugs a home router into the wall and half the floor gets bad IPs — snooping is why that fails at real shops."},
56:{eli:"WPA3's SAE handshake is a lock that can't be picked offline — a stolen handshake is useless without live, rate-limited guesses.",use:"Home: WPA3 (or WPA2/WPA3 mixed) + a long passphrase. Corporate: 802.1X per-user logins through RADIUS."},
57:{eli:"Old networking is texting every switch individually; SDN is one group chat (the controller) that programs them all at once.",use:"Catalyst Center dashboards are exactly this — you declare intent, the controller writes the CLI on every box."},
58:{eli:"A REST API is a vending machine: GET looks at the rows, POST buys, DELETE returns it — and JSON is the receipt format.",use:"Your automation projects level up here: script the controller's API instead of clicking around its GUI."},
59:{eli:"Ansible is a keyholder walking device-to-device over SSH with a to-do list (playbook) — nothing to install on the boxes.",use:"Push one YAML change to 200 switches instead of opening 200 SSH sessions — and git gives you instant rollback."},
60:{eli:"The exam is a boss fight with no backtracking — commit to answers, keep pace, trust the numbers you drilled.",use:"Book Pearson VUE, warm up with Review + the Subnet Drill that morning, and read the last line of every question first."}
};
for (const L of LESSONS) Object.assign(L, EXTRAS[L.id] || {});
