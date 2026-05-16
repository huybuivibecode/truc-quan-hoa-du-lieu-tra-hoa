// js2.js – Doanh thu theo Nhóm hàng
(function(){
  const FILE = "data/data.csv";

  const svg = d3.select("#svg2").attr("viewBox", [0,0,1000,600]);
  const margin = {top: 60, right: 40, bottom: 60, left: 260};
  const width = 1000, height = 600;
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  svg.append("text")
    .attr("x", width/2)
    .attr("y", 30)
    .attr("text-anchor","middle")
    .attr("font-size", 20)
    .attr("font-weight","bold")
    .text("Doanh thu bán hàng theo nhóm hàng");

  const tooltip = d3.select("#tooltip");

  d3.csv(FILE, d => {
    const sl = +String(d["SL"]).replace(/,/g,"");
    const dongia = +String(d["Đơn giá"]).replace(/,/g,"");
    return {
      group: d["Tên nhóm hàng"] || d["Mã và Tên nhóm hàng"], // ⚡ thử cả 2
      revenue: sl * dongia
    };
  }).then(data => {
    console.log("Data mẫu:", data.slice(0,5));

    const grouped = d3.rollups(
      data,
      v => d3.sum(v, d => d.revenue),
      d => d.group
    ).map(([group, sum]) => ({ group, revenue: sum/1e6 }));

    grouped.sort((a,b) => d3.descending(a.revenue, b.revenue));

    const x = d3.scaleLinear()
      .domain([0, d3.max(grouped, d => d.revenue)]).nice()
      .range([0, innerW]);
    const y = d3.scaleBand()
      .domain(grouped.map(d => d.group))
      .range([0, innerH])
      .padding(0.2);

    g.append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(d => d + " triệu"));

    g.append("g").call(d3.axisLeft(y).tickSize(0));

    g.selectAll("rect")
      .data(grouped)
      .join("rect")
        .attr("y", d => y(d.group))
        .attr("height", y.bandwidth())
        .attr("x", 0)
        .attr("width", 0)
        .attr("fill", (d,i) => d3.schemeSet2[i % 8])
      .on("mousemove", (event,d) => {
        tooltip.style("opacity",1)
          .style("left", (event.pageX+15)+"px")
          .style("top", (event.pageY-20)+"px")
          .html(`<b>Nhóm hàng:</b> ${d.group}<br>
                 <b>Doanh thu:</b> ${d.revenue.toFixed(0)} triệu VND`);
      })
      .on("mouseleave", ()=>tooltip.style("opacity",0))
      .transition().duration(1000)
        .attr("width", d => x(d.revenue));

    g.selectAll(".label")
      .data(grouped)
      .join("text")
        .attr("x", d => x(d.revenue) + 6)
        .attr("y", d => y(d.group) + y.bandwidth()/2)
        .attr("dominant-baseline","middle")
        .attr("font-size",12)
        .text(d => `${d.revenue.toFixed(0)} triệu VND`);
  });
})();
