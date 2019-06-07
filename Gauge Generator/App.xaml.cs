using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;

namespace Gauge_Generator
{
    /// <summary>
    /// Interaction logic for App.xaml
    /// </summary>
    public partial class App : Application
    {
        const string RP_FILE = "\\_config.ggrp";
        const int SPLASH_TIME = 2000;

        private void Application_Startup(object sender, StartupEventArgs e)
        {
            //Recent Projects
            Global.rp = new DataManagementSystem.DMS<RecentProjects>("GaugeGenRP", ref Global.rp_container, AppDomain.CurrentDomain.BaseDirectory + RP_FILE);
            Global.rp.FileUpdated += FU;
            Global.rp.LoadFromSource();

#if !DEBUG
            //Splash screen
            SplashWindow splash = new SplashWindow();
            splash.Show();
            Stopwatch timer = new Stopwatch();
            timer.Start();
            timer.Stop();
            int remainingTimeToShowSplash = SPLASH_TIME - (int)timer.ElapsedMilliseconds;
            if (remainingTimeToShowSplash > 0) Thread.Sleep(remainingTimeToShowSplash);
#endif

            MainWindow w = new MainWindow();
            if (e.Args.Length > 0) w.LoadData(e.Args[0], false);
            w.Show();

#if !DEBUG
            splash.Close();
#endif

            if (Global.dms.PathToFile == "")
            {
                HomeWindow h = new HomeWindow()
                {
                    Owner = w
                };
                h.ShowDialog();
                h.Close();
            }
        }

        private void FU(ref RecentProjects obj)
        {
            Global.rp_container = obj;
        }
    }
}
