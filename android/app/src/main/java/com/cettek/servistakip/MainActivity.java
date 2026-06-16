package com.cettek.servistakip;

import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.WebViewListener;

public class MainActivity extends BridgeActivity {
    @Override
    public void onStart() {
        super.onStart();
        
        WebView webView = this.getBridge().getWebView();
        webView.getSettings().setAllowFileAccess(true);
        webView.getSettings().setAllowFileAccessFromFileURLs(true);
        webView.getSettings().setAllowUniversalAccessFromFileURLs(true);

        this.getBridge().addWebViewListener(new WebViewListener() {
            @Override
            public void onReceivedError(WebView webView) {
                String url = webView.getUrl();
                if (url != null && !url.contains("error.html")) {
                    webView.post(new Runnable() {
                        @Override
                        public void run() {
                            webView.loadUrl("file:///android_asset/public/error.html");
                        }
                    });
                }
            }
        });
    }
}
