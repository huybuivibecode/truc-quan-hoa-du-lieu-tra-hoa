// js1.js – Biểu đồ thanh ngang Doanh số theo Mặt hàng
(function(){
  const FILE = "data/data.csv"; // file dữ liệu gốc

  const svg = d3.select("#svg1").attr("viewBox", [0,0,1200,640]);
  const margin = {top: 60, right: 200, bottom: 60, left: 280};
  const width = 1200, height = 640;
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  // Tiêu đề
  svg.append("text")
    .attr("x", width/2)
    .attr("y", 30)
    .attr("text-anchor","middle")
    .attr("font-size", 20)
    .attr("font-weight", "bold")
    .text("Doanh số bán hàng theo Mặt hàng");

  // Tooltip (phải có #tooltip trong HTML)
  const tooltip = d3.select("#tooltip");

  // Màu theo nhóm hàng
  const color = d3.scaleOrdinal()
    .domain(["Bột","Trà hoa","Trà mix","Set trà","Trà củ, quả sấy"])
    .range(["#1f77b4","#ff7f0e","#d62728","#9467bd","#2ca02c"]);

  d3.csv(FILE, d => {
    const sl = +String(d["SL"]).replace(/,/g,"");
    const dongia = +String(d["Đơn giá"]).replace(/,/g,"");
    return {
      code: d["Mã mặt hàng"],
      name: d["Tên mặt hàng"],
      group: d["Tên nhóm hàng"],
      SL: sl,
      DoanhThu: sl * dongia,
      label: `[${d["Mã mặt hàng"]}] ${d["Tên mặt hàng"]}`
    };
  }).then(data => {
    // Gom nhóm
    const agg = d3.rollups(
      data,
      v => ({
        SL: d3.sum(v, d=>d.SL),
        DoanhThu: d3.sum(v, d=>d.DoanhThu),
        group: v[0].group
      }),
      d => d.code,
      d => d.name
    ).map(([code, inner]) => {
      const [name, val] = inner[0];
      return {
        code: code,
        name: name,
        group: val.group,
        SL: val.SL,
        DoanhThu: val.DoanhThu,
        label: `[${code}] ${name}`
      };
    });

    // Sort giảm dần
    agg.sort((a,b) => d3.descending(a.DoanhThu, b.DoanhThu));

    // Scales
    const x = d3.scaleLinear()
      .domain([0, d3.max(agg, d => d.DoanhThu)]).nice()
      .range([0, innerW]);
    const y = d3.scaleBand()
      .domain(agg.map(d => d.label))
      .range([0, innerH])
      .padding(0.2);

    // Trục X
    g.append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(x)
        .ticks(6)
        .tickFormat(d => d3.format(",")(Math.round(d/1e6)) + " triệu"))
      .selectAll("text")
        .attr("font-size", 12);

    // Trục Y
    g.append("g")
      .call(d3.axisLeft(y).tickSize(0))
      .selectAll("text")
        .attr("font-size", 12);

    // Thanh + tooltip
    g.selectAll("rect")
      .data(agg)
      .join("rect")
        .attr("y", d => y(d.label))
        .attr("height", y.bandwidth())
        .attr("x", 0)
        .attr("width", 0)
        .attr("fill", d => color(d.group))
      .on("mousemove", function(event,d) {
        tooltip
          .style("opacity", 1)
          .style("left", (event.pageX + 15) + "px")
          .style("top", (event.pageY - 28) + "px")
          .html(`
            <b>Mặt hàng:</b> ${d.label}<br>
            <b>Nhóm hàng:</b> ${d.group}<br>
            <b>Doanh số bán:</b> ${Math.round(d.DoanhThu/1e6)} triệu VND<br>
            <b>Số lượng bán:</b> ${d.SL.toLocaleString()} SKUs
          `);
      })
      .on("mouseleave", () => tooltip.style("opacity",0))
      .transition().duration(1000)
        .attr("width", d => x(d.DoanhThu));

    // Nhãn giá trị cuối thanh
    g.selectAll(".label")
      .data(agg)
      .join("text")
        .attr("class","label")
        .attr("x", d => x(d.DoanhThu) + 6)
        .attr("y", d => y(d.label) + y.bandwidth()/2)
        .attr("dominant-baseline","middle")
        .attr("font-size",12)
        .text(d => `${Math.round(d.DoanhThu/1e6)} triệu VND`);

    // Legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width - margin.right + 80},${margin.top})`);
    const groups = color.domain();
    groups.forEach((grp,i)=>{
      const row = legend.append("g").attr("transform",`translate(0,${i*22})`);
      row.append("rect").attr("width",14).attr("height",14).attr("fill",color(grp));
      row.append("text").attr("x",20).attr("y",11).attr("font-size",12).text(grp);
    });
  });
})();
