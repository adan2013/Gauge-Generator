using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Linq;
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

        private void Application_Startup(object sender, StartupEventArgs e)
        {
            //Recent Projects
            Global.rp = new DataManagementSystem.DMS<RecentProjects>("GaugeGenRP", ref Global.rp_container, AppDomain.CurrentDomain.BaseDirectory + RP_FILE);
            Global.rp.FileUpdated += FU;
            Global.rp.LoadFromSource();

            MainWindow w = new MainWindow();
            if (e.Args.Length > 0) w.LoadData(e.Args[0], false);
            w.Show();

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
