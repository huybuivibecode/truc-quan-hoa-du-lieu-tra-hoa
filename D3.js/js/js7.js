// js7.js – Xác suất bán hàng theo Nhóm hàng
(function(){
  const FILE = "data/data.csv";

  const svg = d3.select("#svg7").attr("viewBox", [0,0,1000,600]);
  const margin = {top: 60, right: 40, bottom: 60, left: 220};
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
    .text("Xác suất bán hàng theo Nhóm hàng");

  const tooltip = d3.select("#tooltip");

  d3.csv(FILE, d => ({
    groupCode: (d["Mã nhóm hàng"] || "").trim(),
    groupName: (d["Tên nhóm hàng"] || "").trim(),
    orderId: (d["Mã đơn hàng"] || "").trim()
  })).then(data => {
    // B1: tổng số đơn duy nhất
    const tongDonHang = new Set(data.map(d => d.orderId)).size;

    // B2+B3: số đơn duy nhất theo nhóm
    const groupedMap = d3.rollups(
      data,
      v => new Set(v.map(d => d.orderId)).size,
      d => `${d.groupCode}||${d.groupName}`
    );

    const grouped = groupedMap.map(([key, count]) => {
      const [code, name] = key.split("||");
      return {
        code,
        name,
        orders: count,
        prob: count / tongDonHang,
        display: `[${code}] ${name}`
      };
    });

    // B4: best/worst
    const best = d3.max(grouped, d => d.prob);
    const worst = d3.min(grouped, d => d.prob);
    const topGroup = grouped.find(d => d.prob === best);
    const bottomGroup = grouped.find(d => d.prob === worst);

    console.log(`Nhóm dễ bán nhất: [${topGroup.code}] ${topGroup.name}, ${(topGroup.prob*100).toFixed(2)}%`);
    console.log(`Nhóm khó bán nhất: [${bottomGroup.code}] ${bottomGroup.name}, ${(bottomGroup.prob*100).toFixed(2)}%`);

    // sắp xếp
    grouped.sort((a,b) => d3.descending(a.prob, b.prob));

    // scale
    const x = d3.scaleLinear()
      .domain([0, d3.max(grouped, d => d.prob)]).nice()
      .range([0, innerW]);

    const y = d3.scaleBand()
      .domain(grouped.map(d => d.display))
      .range([0, innerH])
      .padding(0.2);

    // axis
    g.append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(x).tickFormat(d3.format(".0%")));

    g.append("g").call(d3.axisLeft(y).tickSize(0));

    // bars
    g.selectAll("rect")
      .data(grouped)
      .join("rect")
        .attr("y", d => y(d.display))
        .attr("x", 0)
        .attr("height", y.bandwidth())
        .attr("width", 0)
        .attr("fill", (d,i) => {
          if(d.code === topGroup.code) return "green";   // highlight dễ bán
          if(d.code === bottomGroup.code) return "red";  // highlight khó bán
          return d3.schemeSet2[i % 8];
        })
      .on("mousemove", (event,d) => {
        tooltip.style("opacity",1)
          .style("left", (event.pageX+15)+"px")
          .style("top", (event.pageY-20)+"px")
          .html(`<b>${d.display}</b><br>
                 Đơn hàng duy nhất: ${d.orders}<br>
                 Xác suất: ${(d.prob*100).toFixed(2)}%`);
      })
      .on("mouseleave", ()=>tooltip.style("opacity",0))
      .transition().duration(1000)
        .attr("width", d => x(d.prob));

    // nhãn %
    g.selectAll(".label")
      .data(grouped)
      .join("text")
        .attr("x", d => x(d.prob) + 6)
        .attr("y", d => y(d.display) + y.bandwidth()/2)
        .attr("dominant-baseline","middle")
        .attr("font-size",12)
        .text(d => (d.prob*100).toFixed(1) + "%");

    // bỏ khung viền
    g.selectAll(".domain").remove();
  });
})();
