
/// <reference path="../pb_data/types.d.ts" />

routerAdd("GET", "/{$}", (e) => {
    const fileContent = $os.readFile(`${__hooks}/../.pocketbase-version`)
    const contentStr = Array.isArray(fileContent) 
        ? String.fromCharCode.apply(null, fileContent) 
        : fileContent
    const pbVersion = `v${contentStr.replace(/\n/g, '').trim()}`
    const externalUrl = `https://horizons-static-cdn.hostinger.com/pocketbase/__PB_VERSION__/ui/dist/index.html`.replace("__PB_VERSION__", pbVersion)

    try {
        const response = $http.send({
            url: externalUrl,
            method: "GET",
            timeout: 30,
        })

        const htmlContent = Array.isArray(response.body)
            ? String.fromCharCode.apply(null, response.body)
            : response.body

        // The PocketBase dashboard is a separate, prebuilt application. Keep its
        // layout intact while making the interface easier to scan and use by
        // lifting the base rem size slightly. The controls inherit this size so
        // tables, labels, dialogs, and forms stay visually consistent.
        const dashboardTypography = `<style id="netia-dashboard-typography">
            html { font-size: 17px; }
            body, button, input, select, textarea { font-size: 1rem; }
            input, select, textarea { min-height: 2.6rem; }
        </style>`
        const enhancedHtml = htmlContent.replace('</head>', `${dashboardTypography}</head>`)

        return e.html(response.statusCode, enhancedHtml)
    } catch (err) {
        throw new NotFoundError("Failed to load dashboard", err)
    }
})
