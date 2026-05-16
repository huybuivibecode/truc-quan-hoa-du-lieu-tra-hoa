// js file 8
// js8.js – Xác suất bán hàng theo Nhóm hàng và Tháng
(function(){
  const FILE = "data/data.csv";

  const svg = d3.select("#svg8").attr("viewBox", [0,0,1000,600]);
  const margin = {top: 60, right: 40, bottom: 100, left: 100};
  const width = 1000, height = 600;
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  svg.append("text")
    .attr("x", width/2)
    .attr("y", 30)
    .attr("text-anchor","middle")
    .attr("font-size", 18)
    .attr("font-weight","bold")
    .text("Xác suất bán hàng theo Nhóm hàng và Tháng");

  const tooltip = d3.select("#tooltip");

  d3.csv(FILE, d => ({
    orderId: (d["Mã đơn hàng"] || "").trim(),
    groupCode: (d["Mã nhóm hàng"] || "").trim(),
    groupName: (d["Tên nhóm hàng"] || "").trim(),
    date: new Date(d["Thời gian tạo đơn"])
  })).then(data => {
    // B1: thêm cột Tháng
    data.forEach(d => d.month = d.date.getMonth() + 1);

    // B2: tổng số đơn duy nhất theo tháng
    const donhangThang = d3.rollups(
      data,
      v => new Set(v.map(d => d.orderId)).size,
      d => d.month
    );

    const donhangThangMap = new Map(donhangThang);

    // B3: số đơn duy nhất theo nhóm + tháng
    const donhangNhomThang = d3.rollups(
      data,
      v => new Set(v.map(d => d.orderId)).size,
      d => d.month,
      d => `${d.groupCode}||${d.groupName}`
    ).flatMap(([month, arr]) =>
      arr.map(([key, count]) => {
        const [code, name] = key.split("||");
        return {
          month,
          code,
          name,
          display: `[${code}] ${name}`,
          orders: count,
          prob: count / donhangThangMap.get(month)
        };
      })
    );

    // B4: nhóm theo display để vẽ line
    const nested = d3.groups(donhangNhomThang, d => d.display);

    // scale
    const x = d3.scalePoint()
      .domain([...new Set(donhangNhomThang.map(d => d.month))])
      .range([0, innerW])
      .padding(0.5);

    const y = d3.scaleLinear()
      .domain([0, d3.max(donhangNhomThang, d => d.prob)]).nice()
      .range([innerH, 0]);

    const color = d3.scaleOrdinal(d3.schemeTableau10)
      .domain(nested.map(d => d[0]));

    // axis
    g.append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(x).tickFormat(d => "T" + String(d).padStart(2,"0")));

    g.append("g")
      .call(d3.axisLeft(y).tickFormat(d3.format(".0%")));

    // line generator
    const line = d3.line()
      .x(d => x(d.month))
      .y(d => y(d.prob));

    // vẽ line
    nested.forEach(([key, values]) => {
      values.sort((a,b) => d3.ascending(a.month,b.month));

      g.append("path")
        .datum(values)
        .attr("fill","none")
        .attr("stroke", color(key))
        .attr("stroke-width", 2)
        .attr("d", line);

      // vẽ marker
      g.selectAll(".dot-"+key)
        .data(values)
        .join("circle")
          .attr("cx", d => x(d.month))
          .attr("cy", d => y(d.prob))
          .attr("r", 4)
          .attr("fill", color(key))
          .on("mousemove", (event,d) => {
            tooltip.style("opacity",1)
              .style("left", (event.pageX+15)+"px")
              .style("top", (event.pageY-20)+"px")
              .html(`<b>${d.display}</b><br>
                     Tháng: T${String(d.month).padStart(2,"0")}<br>
                     Xác suất: ${(d.prob*100).toFixed(2)}%`);
          })
          .on("mouseleave", ()=>tooltip.style("opacity",0));
    });

    // legend dưới biểu đồ
    const legend = svg.append("g")
      .attr("transform", `translate(${width/2},${height-20})`)
      .attr("text-anchor","middle");

    const items = legend.selectAll(".legend-item")
      .data(nested.map(d => d[0]))
      .join("g")
        .attr("transform",(d,i)=>`translate(${(i-nested.length/2)*120},0)`);

    items.append("circle")
      .attr("r",6)
      .attr("fill", d => color(d));

    items.append("text")
      .attr("x",12)
      .attr("y",4)
      .attr("font-size",12)
      .text(d => d);
  });
})();
