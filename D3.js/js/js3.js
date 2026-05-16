// js3.js – Doanh thu theo Tháng
(function(){
  const FILE = "data/data.csv";

  const svg = d3.select("#svg3").attr("viewBox", [0,0,1000,600]);
  const margin = {top: 60, right: 40, bottom: 60, left: 80};
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
    .text("Doanh thu bán hàng theo tháng");

  const tooltip = d3.select("#tooltip");

  d3.csv(FILE, d => {
    const sl = +String(d["SL"]||0).replace(/,/g,"");
    const dongia = +String(d["Đơn giá"]||0).replace(/,/g,"");
    const revenue = sl * dongia;
    const date = new Date(d["Thời gian tạo đơn"]);
    const month = date.getMonth() + 1; // 1–12
    return { month, revenue, sl };
  }).then(data => {
    // nhóm theo tháng
    const monthly = d3.rollups(
      data,
      v => ({
        revenue: d3.sum(v, d => d.revenue),
        sl: d3.sum(v, d => d.sl)
      }),
      d => d.month
    ).map(([month, vals]) => ({
      month,
      revenue: vals.revenue,
      sl: vals.sl,
      revenueM: vals.revenue/1e6
    }));

    monthly.sort((a,b) => d3.ascending(a.month, b.month));

    // tìm tháng tốt/xấu nhất
    const best = d3.max(monthly, d => d.revenue);
    const worst = d3.min(monthly, d => d.revenue);
    const bestMonth = monthly.find(d => d.revenue === best);
    const worstMonth = monthly.find(d => d.revenue === worst);

    console.log(`Tháng bán chạy nhất: T${bestMonth.month}, ${bestMonth.revenueM.toFixed(0)} triệu, SL=${bestMonth.sl}`);
    console.log(`Tháng bán kém nhất: T${worstMonth.month}, ${worstMonth.revenueM.toFixed(0)} triệu, SL=${worstMonth.sl}`);

    const x = d3.scaleBand()
      .domain(monthly.map(d => d.month))
      .range([0, innerW])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(monthly, d => d.revenueM)]).nice()
      .range([innerH, 0]);

    g.append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(x).tickFormat(d => "T" + d));

    g.append("g")
      .call(d3.axisLeft(y).ticks(6).tickFormat(d => d + " triệu"));

    // vẽ cột
    g.selectAll("rect")
      .data(monthly)
      .join("rect")
        .attr("x", d => x(d.month))
        .attr("y", innerH)
        .attr("width", x.bandwidth())
        .attr("height", 0)
        .attr("fill", (d,i) => d3.schemeTableau10[i % 10])
      .on("mousemove", (event,d) => {
        tooltip.style("opacity",1)
          .style("left", (event.pageX+15)+"px")
          .style("top", (event.pageY-20)+"px")
          .html(`<b>Tháng:</b> T${d.month}<br>
                 <b>Doanh thu:</b> ${d.revenueM.toFixed(1)} triệu VNĐ<br>
                 <b>Số lượng:</b> ${d.sl}`);
      })
      .on("mouseleave", ()=>tooltip.style("opacity",0))
      .transition().duration(1000)
        .attr("y", d => y(d.revenueM))
        .attr("height", d => innerH - y(d.revenueM));

    // nhãn giá trị trên cột
    g.selectAll(".label")
      .data(monthly)
      .join("text")
        .attr("x", d => x(d.month) + x.bandwidth()/2)
        .attr("y", d => y(d.revenueM) - 5)
        .attr("text-anchor","middle")
        .attr("font-size",12)
        .text(d => d.revenueM.toFixed(1));
  });
})();
